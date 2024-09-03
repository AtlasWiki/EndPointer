export function URLTest(){
    return(
        <div>
            {urls.map((url, index) => (
                URLItems(url, webpage, jsFile)
            ))}
        </div>
    )
}
