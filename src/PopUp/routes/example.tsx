import { NavBar } from '../../components/navbar'
function Example(){
    return(
        <div>
            <NavBar />
            <h1 className="text-3xl">Vite + React + Tailwindcss</h1>
                <div className="card">
                <p>
                    Edit <code>src/PopUp/routes/example.jsx</code> and build your Pop Up Componenet here!
                    Check out 
                    {/* or even <a href={document.location.href} target="_blank">The webpage/dashboard</a> */}
                 </p>
                </div>
        </div>
    )
}

export default Example;