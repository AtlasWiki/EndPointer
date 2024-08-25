
import { Link } from 'react-router-dom'
import { SetStateAction, useEffect, useState } from 'react'
import './App.css'

function PopUpApp() {
  const [urlParser, setURLParser] = useState(false)
  const [fileDownloader, setFileDownloader] = useState(false)
  const [urlCount, setURLCount] = useState(0) //placeholders TODO: Function to grab URLS and Another to count them
  const [jsFileCount, setJSFileCount] = useState(0) //place holder  TODO: Function to grab js files and another to count the files. 
  const [jsFileCounter, setJSFileCounter] = useState(false)
  
  useEffect(() => {
    // Retrieve the state from localStorage
    chrome.storage.local.get(['urlParser', 'fileDownloader', 'jsFileCounter', 'jsFileCount'], (result) => {
      setURLParser(result.urlParser || false)
      setFileDownloader(result.fileDownloader || false)
      setJSFileCounter(result.jsFileCounter || false)
      setJSFileCount(result.jsFileCount || 0)
    })

    // Listen for updates to the JS file count
    const listener = (message: { action: string; count: SetStateAction<number> }) => {
      if (message.action === 'jsFileCountUpdated') {
        setJSFileCount(message.count)
      }
    }
    chrome.runtime.onMessage.addListener(listener)

    // Cleanup listener on unmount
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  //manage the urlParser button state. 
  function urlParserState() {
    //set default state to false
    const newState = !urlParser
    //if button clicked set state to true and update state
    setURLParser(newState)
    chrome.storage.local.set({ urlParser: newState }, () => {
      console.log('URL Parser state saved:', newState)
    })
    chrome.runtime.sendMessage({ action: 'urlParserChanged', state: newState })
  }

//manage the urlParser button state. 
  function fileDownloaderState() {
    const newState = !fileDownloader
    setFileDownloader(newState)
    chrome.storage.local.set({ fileDownloader: newState }, () => {
      console.log('File Downloader state saved:', newState)
    })
    chrome.runtime.sendMessage({ action: 'fileDownloaderChanged', state: newState })
  }

  //manage the jsFileCounter button state. 
  function jsFileCounterState() {
    const newState = !jsFileCounter
    setJSFileCounter(newState)
    chrome.storage.local.set({ jsFileCounter: newState }, () => {
      console.log('JS File Counter state saved:', newState)
    })
    chrome.runtime.sendMessage({ action: 'jsFileCounterChanged', state: newState })
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
    <div className="w-full md:h-screen m-0 flex flex-col items-center md:justify-center">
      <div className="mt-5 mb-10">
        <h1 className="text-3xl md:text-6xl mb-1">JS-Parser Toolkit</h1>
        <p className="text-gray-400/60 md:text-lg">A JS-Parsing Toolkit with many flexible features by AtlasWiki/mrunoriginal and LordCat</p>
      </div>
      <div className="flex flex-col justify-left gap-10 mx-0">
        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">Endpoint parsing</h2>
          <div className="text-md flex gap-2">
            <button onClick={urlParserState}>
              {displayState(urlParser)}
            </button>
            <button className="a-item font-semibold text-blue-500"><span className="text-violet-500">URLs</span> ({urlCount})</button>
          </div>
        </div>

        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">JS Downloader</h2>
          <div className="text-md flex gap-2">
            <button onClick={fileDownloaderState}>
              {displayState(fileDownloader)}
            </button>
            <button className="a-item font-semibold text-blue-500"><span className="text-violet-500">JS FILES</span> ({jsFileCount})</button>
          </div>
        </div>
      </div>
      <a className="flex justify-center items-center mt-10" href="https://github.com/LordCat/PlaceHolder-Extension" target="_blank">
        <svg className="transition-all duration-1000 hover:size-20" xmlns="http://www.w3.org/2000/svg" width="60px" height="60px" viewBox="0 0 24 24"><path fill="#538ddf" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg>
      </a>
    </div>
  )
}

export default PopUpApp