import { Link } from 'react-router-dom'

import '../App.css'

function PopUpApp() {
  return (
    <div className="w-full md:h-screen m-0 flex flex-col items-center md:justify-center">
      <div className="mt-5 mb-10">
        <h1 className="text-3xl md:text-6xl mb-1">JS-Parser Toolkit</h1>
        <p className="text-gray-400/60 md:text-lg">A JS-Parsing Toolkit with many flexible features by mrunoriginal and Dooma</p>
      </div>
      
      <div className="flex flex-col justify-left gap-10 mx-0">
        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">Endpoint parsing</h2>
          <div className="text-md flex gap-2">
               <button>
                  <div className="flex">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#82e467" d="M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12"/></svg>
                        <span className="text-green-400 font-semibold">ON</span>
                      </div>
                  </div>
               </button>
               <Link className="a-item font-semibold" to="urls"><span className="text-violet-500">URLs</span> (57)</Link>
          </div>
        </div>

        <div className="flex flex-col gap-1 md:gap-5">
          <h2 className="text-xl md:text-4xl">JS Downloader</h2>
          <div className="text-md flex gap-2">
               <button>
                  <div className="flex">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#e63946" d="M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12"/></svg>
                        <span className="text-red-400 font-semibold">OFF</span>
                      </div>
                  </div>
               </button>  
               <Link className="a-item font-semibold" to="js-files"><span className="text-violet-500">JS FILES</span> (17)</Link>
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
