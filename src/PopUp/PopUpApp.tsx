import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

function PopUpApp() {
  const [urlParser, setURLParser] = useState(false)
  const [fileDownloader, setFileDownloader] = useState(false)
  const [urlCount, setURLCount] = useState(0)
  const [jsFileCount, setJSFileCount] = useState(0)
  const [displayScope, setDisplayScope] = useState(false)
  
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
    const newState = !urlParser;
    setURLParser(newState);
    chrome.runtime.sendMessage({ action: 'toggleUrlParser', state: newState }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error toggling URL parser:', chrome.runtime.lastError);
      } else {
        console.log('URL parser state toggled:', response);
      }
    });
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
    <div className="w-full md:h-screen m-0  md:justify-center py-5"> 
    {/* flex flex-col items-center */}
      <div className="mt-5 mb-5 text-center">
        <h1 className="text-4xl font-bold md:text-6xl mb-1">EndPointer</h1>
        <p className="text-gray-400/60 md:text-lg">An endpoint parser and extractor with many flexible features by AtlasWiki/mrunoriginal and LordCat</p>
        <div className="mt-3 flex flex-col justify-center items-center gap-10 mx-0">
          <div className="flex flex-col gap-1 md:gap-5">
            <div className="text-md flex gap-2">
              <button className="a-color a-item" onClick={urlParserState}>
                {displayState(urlParser)}
              </button>
              <button className="a-item a-color font-semibold text-blue-500"><span className="text-violet-500">URLs</span> ({urlCount})</button>
            </div>
          </div>
        </div>
      </div>

      {/* <div className=''>
        <button onClick={() => {setDisplayScope(!displayScope)}} className="text-gray-400/60 font-semibold bg-[#1a1a1a] p-1">SHOW/HIDE</button>
      </div> */}
    
      <div className="w-full text-center flex flex-col justify-center items-center">
        <hr className="w-full border-gray-400/60 mb-5"/>
        <h1 className="text-2xl font-bold mb-2">SCOPE</h1>

        <div className="flex items-center justify-center gap-0.5">
          <input type="text" className="border-gray-400/60 text-gray-400/60 outline-none border-2 py-1 rounded-sm px-2 bg-transparent" placeholder="example.com"/>
          <button className="border-2 border-gray-400/60 text-green-700 rounded-sm py-1 px-2 font-bold">+</button>
        </div>
     
        <div className="mt-5 w-3/4 flex items-center justify-center text-center border-2 border-gray-400/60 overflow-auto h-20 pb-5 rounded-md">
          <div className="mt-5 flex flex-col px-1">
            <div className="flex">
              <span className="text-teal-500 py-1 px-1">Example.com</span>
              <button className="text-center pl-1 text-rose-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#df4950" d="M19 12.998H5v-2h14z" />
                </svg>
              </button>
            </div>
            <div className="flex">
              <span className="text-teal-500 py-1 px-1">Example.com</span>
              <button className="text-center pl-1 text-rose-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#df4950" d="M19 12.998H5v-2h14z" />
                </svg>
              </button>
            </div>
            <div className="flex">
              <span className="text-teal-500 py-1 px-1">Example.com</span>
              <button className="text-center pl-1 text-rose-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#df4950" d="M19 12.998H5v-2h14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <button className='mt-2'>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#726e6e" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"/>
            <title>Clear All</title>
          </svg>
        </button>
        
        <hr className="w-full bg-gray-400/60 border-gray-400/60 mb-5 mt-5"/>
    </div>
      

      <div className="flex gap-2 justify-center items-center">
        <a href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="#726e6e" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg>
        </a>
        <a href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="#726e6e" d="M19.9 12.66a1 1 0 0 1 0-1.32l1.28-1.44a1 1 0 0 0 .12-1.17l-2-3.46a1 1 0 0 0-1.07-.48l-1.88.38a1 1 0 0 1-1.15-.66l-.61-1.83a1 1 0 0 0-.95-.68h-4a1 1 0 0 0-1 .68l-.56 1.83a1 1 0 0 1-1.15.66L5 4.79a1 1 0 0 0-1 .48L2 8.73a1 1 0 0 0 .1 1.17l1.27 1.44a1 1 0 0 1 0 1.32L2.1 14.1a1 1 0 0 0-.1 1.17l2 3.46a1 1 0 0 0 1.07.48l1.88-.38a1 1 0 0 1 1.15.66l.61 1.83a1 1 0 0 0 1 .68h4a1 1 0 0 0 .95-.68l.61-1.83a1 1 0 0 1 1.15-.66l1.88.38a1 1 0 0 0 1.07-.48l2-3.46a1 1 0 0 0-.12-1.17ZM18.41 14l.8.9l-1.28 2.22l-1.18-.24a3 3 0 0 0-3.45 2L12.92 20h-2.56L10 18.86a3 3 0 0 0-3.45-2l-1.18.24l-1.3-2.21l.8-.9a3 3 0 0 0 0-4l-.8-.9l1.28-2.2l1.18.24a3 3 0 0 0 3.45-2L10.36 4h2.56l.38 1.14a3 3 0 0 0 3.45 2l1.18-.24l1.28 2.22l-.8.9a3 3 0 0 0 0 3.98m-6.77-6a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2"/></svg>
        </a>
      </div>
      {/* <div className="flex flex-col justify-left gap-10 mx-0">
        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl font-bold">ENDPOINT PARSE</h2>
          <div className="text-md flex gap-2">
            <button className="a-color a-item" onClick={urlParserState}>
              {displayState(urlParser)}
            </button>
            <button className="a-item a-color font-semibold text-blue-500"><span className="text-violet-500">URLs</span> ({urlCount})</button>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default PopUpApp