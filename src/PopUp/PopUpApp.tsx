import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

function PopUpApp() {
  const [urlParser, setURLParser] = useState(false)
  const [fileDownloader, setFileDownloader] = useState(false)
  const [urlCount, setURLCount] = useState(0)
  const [jsFileCount, setJSFileCount] = useState(0)
  
  useEffect(() => {
    chrome.storage.local.get(['urlParser', 'fileDownloader', 'urlCount', 'jsFileCount'], (result) => {
      setURLParser(result.urlParser || false)
      setFileDownloader(result.fileDownloader || false)
      setURLCount(result.urlCount || 0)
      setJSFileCount(result.jsFileCount || 0)
    })

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      for (let key in changes) {
        const storageChange = changes[key]
        switch(key) {
          case 'urlParser':
            setURLParser(storageChange.newValue)
            break
          case 'fileDownloader':
            setFileDownloader(storageChange.newValue)
            break
          case 'urlCount':
            setURLCount(storageChange.newValue)
            break
          case 'jsFileCount':
            setJSFileCount(storageChange.newValue)
            break
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  function urlParserState() {
    const newState = !urlParser
    setURLParser(newState)
    chrome.runtime.sendMessage({ action: 'urlParserChanged', state: newState })
  }

  function fileDownloaderState() {
    const newState = !fileDownloader
    setFileDownloader(newState)
    chrome.runtime.sendMessage({ action: 'fileDownloaderChanged', state: newState })
  }

  function displayState(state: boolean) {
    return (
      <div className="flex">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill={state ? "#82e467" : "#e63946"} d="M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12"/>
          </svg>
          <span className={state ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
            {state ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:h-screen m-0 flex flex-col items-center md:justify-center py-5">
      <div className="mt-5 mb-10 text-center">
        <h1 className="text-3xl md:text-6xl mb-1">EndPointer</h1>
        <p className="text-gray-400/60 md:text-lg">An endpoint parser and extractor with many flexible features by AtlasWiki/mrunoriginal and LordCat</p>
      </div>
      <div className="flex flex-col justify-left gap-10 mx-0">
        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">Endpoint parsing</h2>
          <div className="text-md flex gap-2">
            <button className="a-color a-item" onClick={urlParserState}>
              {displayState(urlParser)}
            </button>
            <button className="a-item a-color font-semibold text-blue-500"><span className="text-violet-500">URLs</span> ({urlCount})</button>
          </div>
        </div>

        {/* <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">JS Downloader</h2>
          <div className="text-md flex gap-2">
            <button onClick={fileDownloaderState}>
              {displayState(fileDownloader)}
            </button>
            <Link to="/js-files" className="a-item font-semibold text-blue-500">
              <span className="text-violet-500">JS FILES</span> ({jsFileCount})
            </Link>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default PopUpApp