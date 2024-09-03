import { useEffect, useState } from 'react'


export function URLsList(){
    const [urls, setURLs] = useState([])
    const [webpage, setWebpage] = useState("")
    const [jsFile, setJSFile] = useState("")

    useEffect(() => {
        chrome.storage.local.get("URL-PARSER", (data) => {
            const urlParser = data["URL-PARSER"];
            let allCombinedURLs = [];  // Initialize an empty array to accumulate URLs
    
            // Iterate through each key in URL-PARSER
            Object.keys(urlParser).forEach((key) => {
                if (key !== "current") {
                    setWebpage(key);
                    const currURLEndpoints = urlParser[key]["currPage"];
                    const currURLExtJSFiles = urlParser[key]["externalJSFiles"];
                    
                    setJSFile(currURLExtJSFiles)
                    const endpointsInExtJSFiles = Object.values(currURLExtJSFiles).flat();
                    const combinedURLs = [...currURLEndpoints, ...endpointsInExtJSFiles];
    
                    // Accumulate all combined URLs
                    allCombinedURLs = [...allCombinedURLs, ...combinedURLs];
                }
            });
    
            // Set the state once after the loop
            setURLs(allCombinedURLs);
        });
    }, []);
}

export function URLProps(endpoint){
    return(
        <tr>
            <td>{endpoint.url}</td>
            <td>{endpoint.foundAt}</td>
            <td>{endpoint.webpage}</td>
            <td><a href="#" target="_blank">View here</a></td>
        </tr>
    )
}












let urlElements = []

export function URLItems(endpoint, webpage, jsFile){
    urlElements.push( 
        <URLProps
            url={endpoint}
            foundAt={webpage}
            webpage={jsFile}
        />
    )
}

const [urls, setURLs] = useState([])
const [webpage, setWebpage] = useState("")
const [jsFile, setJSFile] = useState("")

useEffect(() => {
    chrome.storage.local.get("URL-PARSER", (data) => {
        const urlParser = data["URL-PARSER"];
        Object.keys(urlParser).forEach((key) => {
            if (key !== "current") {
                setWebpage(key);
                const currURLEndpoints = urlParser[key]["currPage"];
                const currURLExtJSFiles = urlParser[key]["externalJSFiles"];
                
                setJSFile(currURLExtJSFiles)
                const endpointsInExtJSFiles = Object.values(currURLExtJSFiles).flat();
                const combinedURLs = [...currURLEndpoints, ...endpointsInExtJSFiles];
                setURLs(combinedURLs)

                urls.forEach((url) => {
                    URLItems(url, webpage, jsFile)
                })
                
            }
        });
    });
}, []);

export function Page(){
    return(
        <div>
            {urls.map((url, index) => (
                        URLItems(url, webpage, jsFile)
            ))}
        </div>
    )
}