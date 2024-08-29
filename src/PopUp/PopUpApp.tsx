import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getParserEnabledState, setParserEnabledState, getURLParserState } from '../components/content/storage'
import { URLParserState } from '../components/sharedTypes/types'
import './App.css'

function PopUpApp() {
  const [parserState, setParserState] = useState<URLParserState>({ enabled: false, lastParsed: null })
  const [urlCount, setURLCount] = useState(0)
  const [jsFileCount, setJSFileCount] = useState(0)
  
  useEffect(() => {
    const loadState = async () => {
      const state = await getParserEnabledState()
      setParserState(state)
      updateCounts()
    }
    loadState()
  }, [])

  const updateCounts = async () => {
    const urlParserData = await getURLParserState()
    let totalURLs = 0
    let totalJSFiles = 0
    Object.values(urlParserData).forEach(pageData => {
      totalURLs += pageData.currPage.length
      totalJSFiles += Object.keys(pageData.externalJSFiles).length
      Object.values(pageData.externalJSFiles).forEach(urls => {
        totalURLs += urls.length
      })
    })
    setURLCount(totalURLs)
    setJSFileCount(totalJSFiles)
  }

  const toggleParser = async () => {
    const newState: URLParserState = {
      enabled: !parserState.enabled,
      lastParsed: parserState.enabled ? parserState.lastParsed : new Date()
    }
    await setParserEnabledState(newState)
    setParserState(newState)
    if (newState.enabled) {
      chrome.runtime.sendMessage({ action: 'startUrlParsing' })
    }
  }

  function displayState(state: boolean) {
    return (
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill={state ? "#82e467" : "#e63946"} d="M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12"/>
        </svg>
        <span className={state ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
          {state ? "ON" : "OFF"}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full md:h-screen m-0 flex flex-col items-center md:justify-center">
      <div className="mt-5 mb-10">
        <h1 className="text-3xl md:text-6xl mb-1">JS Toolkit</h1>
        <p className="text-gray-400/60 md:text-lg">A JS Toolkit with many flexible features</p>
      </div>
      <div className="flex flex-col justify-left gap-10 mx-0">
        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">URL Parser</h2>
          {/* <div className="text-md grid grid-cols-3 gap-2"> */}
          <div className="text-md flex items-center justify-content gap-2">
            <button onClick={toggleParser}>
              {displayState(parserState.enabled)}
            </button>
            <span className="font-semibold text-blue-500">
              <span className="a-item text-violet-500">URLs <span className="text-blue-500">({urlCount})</span></span> 
            </span>
            <span className="font-semibold text-blue-500">
              <span className="a-item text-violet-500">JS Files <span className="text-blue-500">({jsFileCount})</span></span> 
            </span>
          </div>
          {parserState.lastParsed && (
            <p className="text-sm text-gray-500">
              Last parsed: {new Date(parserState.lastParsed).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PopUpApp