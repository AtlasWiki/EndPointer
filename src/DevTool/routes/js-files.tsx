import { NavBar } from '../../components/navbar'

export function JSFiles(){
    return(
        <div>
            <NavBar />
            <h1>JS FILES</h1>
            <p>
                Located at  { document.location.href }
            </p>
        </div>
    )
}