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
    await browser.storage.local.set({ "URL-PARSER": {} })
    console.log('URL-PARSER has been removed.')
    updateURLCount()
  }
  
  return (
    <div className="w-full bg-customBg md:h-screen m-0 flex flex-col px-5 mt-5">
            <div className="mt-10 mb-10 w-full">
        <div className=" mb-3 flex items-center gap-1">
          <img src={Logo} style={{ width: "5%", height: "5%" }} />
          <h1 className="text-xl ml-6 text-customRed md:text-4xl font-bold">EndPointer <span className='text-white'> Dashboard </span> </h1>
        </div>
        {/* <p className="text-white md:text-lg">An endpoint parser and extractor with many flexible features by AtlasWiki/mrunoriginal and LordCat</p> */}
        <hr className="w-full mt-5"></hr>
      </div>
      <div className="w-full flex gap-4">
        <button className="bg-customFont border-2 border-customFont  text-white rounded-sm p-3" onClick={() => { location.reload() }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M19.933 13.041a8 8 0 1 1-9.925-8.788c3.899-1 7.935 1.007 9.425 4.747"/><path d="M20 4v5h-5"/></g></svg>
        </button>
        <button className="border-customFont border-2 bg-gradient-to-r from-customFont to-customBg text-white text-center p-3 " onClick={clearCache}>
          Clear Cache
        </button>
        <button className="border-2 border-customFont pt-2 pb-2 pl-3 pr-3 rounded-sm bg-customBg" onClick={clearURLs}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="#F43F5E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
            <title>Delete URLs</title>
          </svg>
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4 mx-0">
        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="mt-3 mb-3 text-lg text-customRed md:text-3xl">Endpoint parsing</h2>
          <div className="text-md flex gap-2 w-72 ">
              <button 
                className="w-72 rounded-sm p-3 font-semibold border-customFont border-2 bg-gradient-to-r from-customFont to-customBg" 
                onClick={handleURLButtonClick}
              >
                <span className=" text-white">URLs</span> <span className="text-customFont">({urlCount})</span>
              </button>
          </div>
        </div>
        <hr className="w-full mt-5"></hr>

        <p className="text-customFont mt-8 mb-5 md:text-xs">
          An endpoint parser and extractor with many flexible features by
         <span className="text-white"> <a target="_blank" className='text-white' href="https://www.linkedin.com/in/nathan-w-76ba78202/">  AtlasWiki/mrunoriginal </a></span> and{" "}
          <span className="text-white"><a className='text-white' href="https://www.linkedin.com/in/kristian-alex-kelly/">LordCat</a></span> | Designed by <span className="text-white"><a className='text-white' href="https://www.linkedin.com/in/mahenoor-salat/">Mahenoor</a></span>
        </p>      </div>
    </div>
  )
}

export default DevToolsApp