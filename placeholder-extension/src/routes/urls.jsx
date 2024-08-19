import { NavBar } from '../components/navbar'
export function URLS(){
    return(
        <div>
            <NavBar />
            <h1>URLS</h1>
            <p>
                Located at  { document.location.href }
            </p>
        </div>
    )
}