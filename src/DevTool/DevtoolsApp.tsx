import React, { useState, useEffect } from 'react'
import browser from 'webextension-polyfill'
import { useNavigate } from 'react-router-dom'
import './index.css'
import './App.css'
import Logo from '../../public/icons/EndPointer.png';


function DevToolsApp() {
  const [urlCount, setURLCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    updateURLCount()

    const storageListener = (changes: { [key: string]: browser.Storage.StorageChange }) => {
      if (changes["URL-PARSER"]) {
        updateURLCount()
      }
    }

    browser.storage.onChanged.addListener(storageListener)

    return () => {
      browser.storage.onChanged.removeListener(storageListener)
    }
  }, [])

  const updateURLCount = async () => {
    try {
      const data = await browser.storage.local.get("URL-PARSER")
      const urlParser = data["URL-PARSER"] as Record<string, any>
      let totalURLCount = 0

      Object.keys(urlParser).forEach((key) => {
        if (key !== "current") {
          const currURLEndpoints = urlParser[key]["currPage"] as string[]
          const currURLExtJSFiles = urlParser[key]["externalJSFiles"] as Record<string, string[]>

          const totalEndpointsInCurrPage = currURLEndpoints.length
          const totalEndpointsInExtJSFiles = Object.values(currURLExtJSFiles).flat().length

          totalURLCount += totalEndpointsInCurrPage + totalEndpointsInExtJSFiles
        }
      })

      setURLCount(totalURLCount)
    } catch (error) {
      console.error("Error updating URL count:", error)
    }
  }

  const handleURLButtonClick = () => {
    navigate('/urls')
  }

  const clearCache = async () => {
    await browser.storage.local.clear()
    alert("Cache cleared")
    updateURLCount()
  }

  const clearURLs = async () => {
    await browser.storage.local.remove('URL-PARSER')
    console.log('URL-PARSER has been removed.')
    updateURLCount()
  }
  
  return (
    <div className="w-full md:h-screen m-0 flex flex-col px-5 mt-5">
      <div className="flex gap-1">
        <button className="a-item a-color" onClick={updateURLCount}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#4d4c4c" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M19.933 13.041a8 8 0 1 1-9.925-8.788c3.899-1 7.935 1.007 9.425 4.747"/><path d="M20 4v5h-5"/></g></svg>
        </button>
        <button className="a-item a-color" onClick={clearCache}>
          Clear Cache
        </button>
        <button className="a-item a-color p-2 rounded-md" onClick={clearURLs}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="#F43F5E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
            <title>Delete URLs</title>
          </svg>
        </button>
      </div>
      <div className="mt-10 mb-10 w-full">
        <div className="flex items-center gap-1">
          <img src={Logo} style={{ width: "5%", height: "5%" }} />
          <h1 className="text-3xl md:text-6xl mb-3 font-bold">EndPointer Dashboard</h1>
        </div>
        <p className="text-gray-400/60 md:text-lg">An endpoint parser and extractor with many flexible features by AtlasWiki/mrunoriginal and LordCat</p>
        <hr className="w-full mt-5"></hr>
      </div>

      <div className="mt-5 flex flex-col gap-20 mx-0">
        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">Endpoint parsing</h2>
          <div className="text-md flex gap-2">
              <button 
                className="a-item a-color font-semibold" 
                onClick={handleURLButtonClick}
              >
                <span className="text-violet-500">URLs</span> <span className="text-blue-500">({urlCount})</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DevToolsApp