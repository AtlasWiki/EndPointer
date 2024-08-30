
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
    // let currTab = ""
    // chrome.tabs.get(chrome.devtools.inspectedWindow.tabId, (tab) => {
    //   if (tab && tab.url) {
    //     currTab = tab.url
    //   } else {
    //     console.error("Unable to get current tab URL");
    //   }
    // });

    chrome.storage.local.get(['urlParser', 'fileDownloader', 'jsFileCounter', 'jsFileCount'], (result) => {
      setURLParser(result.urlParser || false)
      setFileDownloader(result.fileDownloader || false)
      setJSFileCounter(result.jsFileCounter || false)
      setJSFileCount(result.jsFileCount || 0)
    })

   
      chrome.storage.local.get("URL-PARSER", (data) => {
        const urlParser = data["URL-PARSER"];
        const currURL = urlParser["current"];
        const currURLEndpoints = urlParser[currURL]["currPage"];
        const currURLExtJSFiles = urlParser[currURL]["externalJSFiles"];
        // Calculate the total number of URLs in currPage and externalJSFiles
        const totalEndpointsInCurrPage = currURLEndpoints.length;
        const totalEndpointsInExtJSFiles = Object.values(currURLExtJSFiles)
          .flat().length;
    
        // Set the total URL count (from currPage and externalJSFiles)
        setURLCount(totalEndpointsInCurrPage + totalEndpointsInExtJSFiles);
      });

    
    

    // Listen for updates to the JS file count
    // const listener = (message: { action: string; count: SetStateAction<number> }) => {
    //   if (message.action === 'jsFileCountUpdated') {
    //     setJSFileCount(message.count)
    //   }
    // }
    // chrome.runtime.onMessage.addListener(listener)

    // // Cleanup listener on unmount
    // return () => chrome.runtime.onMessage.removeListener(listener)
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
    // chrome.runtime.sendMessage({ action: 'urlParserChanged', state: newState })
  }

//manage the urlParser button state. 
  function fileDownloaderState() {
    const newState = !fileDownloader
    setFileDownloader(newState)
    chrome.storage.local.set({ fileDownloader: newState }, () => {
      console.log('File Downloader state saved:', newState)
    })
    // chrome.runtime.sendMessage({ action: 'fileDownloaderChanged', state: newState })
  }

  //manage the jsFileCounter button state. 
  function jsFileCounterState() {
    const newState = !jsFileCounter
    setJSFileCounter(newState)
    chrome.storage.local.set({ jsFileCounter: newState }, () => {
      console.log('JS File Counter state saved:', newState)
    })
    // chrome.runtime.sendMessage({ action: 'jsFileCounterChanged', state: newState })
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
        <h1 className="text-3xl md:text-6xl mb-1">JS Toolkit</h1>
        <p className="text-gray-400/60 md:text-lg">A JS Toolkit with many flexible features by AtlasWiki/mrunoriginal and LordCat</p>
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
    </div>
  )
}

export default PopUpApp