import { Link } from 'react-router-dom'

export function NavBar (){
    return(
        <div>
            <nav>
                <Link to="/"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#4d4c4c" d="m7.825 13l5.6 5.6L12 20l-8-8l8-8l1.425 1.4l-5.6 5.6H20v2z"/></svg></Link>
            </nav>
        </div>
    )
}