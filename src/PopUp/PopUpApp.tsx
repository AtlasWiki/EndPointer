import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import { Link } from 'react-router-dom'
import "./App.css"


function PopUpApp() {

  return (
    <div className="w-full md:flex md:flex-col items-center justify-center md:min-h-screen">
      <div className="flex items-center justify-center space-x-5 mb-8 mt-2 md:mb-5 md:mt-10">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="transition-all duration-1000 size-20 hover:size-24 hover:opacity-50" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="react transition-all duration-1000 size-20 hover:size-24 hover:opacity-50" alt="React logo" />
        </a>
        <a href="https://tailwindcss.com/docs/installation" target="_blank">
          <svg className="transition-all duration-1000 size-20 hover:size-24 hover:opacity-50" xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 24 24"><path fill="#538ddf" d="M12 6c-2.67 0-4.33 1.33-5 4c1-1.33 2.17-1.83 3.5-1.5c.76.19 1.31.74 1.91 1.35c.98 1 2.09 2.15 4.59 2.15c2.67 0 4.33-1.33 5-4c-1 1.33-2.17 1.83-3.5 1.5c-.76-.19-1.3-.74-1.91-1.35C15.61 7.15 14.5 6 12 6m-5 6c-2.67 0-4.33 1.33-5 4c1-1.33 2.17-1.83 3.5-1.5c.76.19 1.3.74 1.91 1.35C8.39 16.85 9.5 18 12 18c2.67 0 4.33-1.33 5-4c-1 1.33-2.17 1.83-3.5 1.5c-.76-.19-1.3-.74-1.91-1.35C10.61 13.15 9.5 12 7 12"/></svg>
        </a>
      </div>
      <h1 className="text-3xl">Vite + React + Tailwindcss</h1>
      <div className="card">
        <p>
          Edit <code>src/PopUpApp/App.jsx</code> and build your Pop Up Componenet here!
          Check out <Link to="example">A separate popup page </Link>
          or even <a href={document.location.href} target="_blank">The webpage/dashboard</a>
        </p>
      </div>
      <p>
        A simple bookmark template created by LordCat and AtlasWiki/mrunoriginal
      </p>
      <p className="read-the-docs">
        Click on the Vite, React, and Tailwindcss logos to learn more
      </p>
      <a className="flex justify-center items-center mt-4" href="https://github.com/LordCat/PlaceHolder-Extension" target="_blank">
        <svg className="transition-all duration-1000 hover:size-32" xmlns="http://www.w3.org/2000/svg" width="60px" height="60px" viewBox="0 0 24 24"><path fill="#538ddf" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg>
      </a>
    </div>
  )
}

export default PopUpApp;
