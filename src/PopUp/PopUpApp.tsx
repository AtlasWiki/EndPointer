
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'

function PopUpApp() {
  const [urlParser, setURLParser] = useState(false)
  const [fileDownloader, setFileDownloader] = useState(false)
  const [urlCount, setURLCount] = useState(0) //placeholders TODO: Function to grab URLS and Another to count them
  const [fileCount, setFileCount] = useState(0) //place holder  TODO: Function to grab js files and another to count the files. 

  useEffect(() => {
    // Retrieve the state when the component mounts
    chrome.storage.local.get(['urlParser', 'fileDownloader'], (result) => {
      setURLParser(result.urlParser || false)
      setFileDownloader(result.fileDownloader || false)
    })
  }, [])

  function urlParserState() {
    const newState = !urlParser
    setURLParser(newState)
    chrome.storage.local.set({ urlParser: newState }, () => {
      console.log('URL Parser state saved:', newState)
    })
    chrome.runtime.sendMessage({ action: 'urlParserChanged', state: newState })
  }

  function fileDownloaderState() {
    const newState = !fileDownloader
    setFileDownloader(newState)
    chrome.storage.local.set({ fileDownloader: newState }, () => {
      console.log('File Downloader state saved:', newState)
    })
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
    <div className="w-full md:h-screen m-0 flex flex-col items-center md:justify-center">
      <div className="flex flex-col justify-left gap-10 mx-0">
        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">Endpoint parsing</h2>
          <div className="text-md flex gap-2">
            <button onClick={urlParserState}>
              {displayState(urlParser)}
            </button>
            <Link className="a-item font-semibold" to="urls"><span className="text-violet-500">URLs</span> ({urlCount})</Link>
          </div>
        </div>

        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">JS Downloader</h2>
          <div className="text-md flex gap-2">
            <button onClick={fileDownloaderState}>
              {displayState(fileDownloader)}
            </button>
            <Link className="a-item font-semibold" to="js-files"><span className="text-violet-500">JS FILES</span> ({fileCount})</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopUpApp