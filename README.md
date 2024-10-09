# EndPointer: URL Finder for JavaScript Files and Webpages

<img src="https://github.com/user-attachments/assets/ff950ea9-b861-4557-9217-e7c22f591b53">

### What is EndPointer?
EndPointer is a browser extension designed for ethical hackers and web developers to discover potentially vulnerable endpoints on the current webpage and its linked JavaScript files. It offers customizable features that allow users to control the scan settings, making it adaptable for various use cases. One standout feature is its ability to capture dynamically loaded JavaScript files, ensuring even asynchronously loaded scripts are analyzed. With EndPointer, users can efficiently identify exposed endpoints and improve the security posture of web applications. This extension was made using our custom extension template in react with many features: https://github.com/LordCat/PlaceHolder-Extension

Key Features:

- <b>URL/Endpoint parsing:</b> Parse for URLs in the current webpage and externally linked javascript files
- <b>Dynamic Script Loading:</b> Parses and checks for dynamically loaded script tags upon initial load
- <b>Auto parsing:</b> Parses automatically when the document is loaded
- <b>Manual parsing:</b> Parses when the "REPARSE" button is clicked
- ...

<br>
<p align="center"><a href="#Download"><img src="https://github.com/user-attachments/assets/5ed1d651-ea44-4f00-87ad-b3fcb3e75e68"></a></p>

To streamline the use of these tools, we've created an easy-to-navigate menu that lets you quickly select the information you need. Below, you can find information for <b>downloading the tool, exploring its features, checking ongoing development, and learning about our generous contributors</b>.

<br>
<br>
<div align="center">
<a href="#Download"><img src="https://github.com/user-attachments/assets/0a9ff34c-eb1b-4b84-a0ab-0a53e9b733af" alt="image (1)" width="83.5"/></a><a href="#Functionalities"><img src="https://github.com/user-attachments/assets/81d51a7e-f179-4d62-bbe3-cc9617bcfe07" alt="image (2)" width="70"/></a><a href="#Development"><img src="https://github.com/user-attachments/assets/f724c998-5ae3-456f-a863-225978ac25c3" alt="image (3)" width="70"/></a><a href="#Contributors"><img src="https://github.com/user-attachments/assets/efbfa71d-37df-4b6c-ae42-4c5d70132a8d" alt="image (4)" width="84"/></a>
</div>
<br>

<a name="Download"></a>
<h2><img src="https://github.com/user-attachments/assets/466328bf-6dce-4cf3-bb53-ce427e8d7f25" width="30"> Download & Installation</h2>

You have several options to download the extension. You can install it directly from the Chrome Web Store or, if you're using Firefox, from the Firefox Add-ons site. Alternatively, you can download the extension from GitHub, giving you access to the source code. For those who want to load it up locally: be sure to run `npm i && npm run build` to download all packages and to create the dist/ file. Then, load the dist/ file as unpacked in Chrome/Firefox.

<div align="left">
<a href="https://chromewebstore.google.com/"><img src="https://github.com/user-attachments/assets/834eb360-3809-421c-9223-7b254957ae37" alt="image (1)" width="170"/></a><a href="https://addons.mozilla.org/en-US/firefox/extensions/"><img src="https://github.com/user-attachments/assets/7585ac45-b59d-4d9e-a4a3-ddfd2d59b533" alt="image (2)" width="170"/></a>
</div>

<br>

<a name="Functionalities"></a>
<h2><img src="https://github.com/user-attachments/assets/499bb537-9478-4341-8d55-773069796de8" width="30"> Key Features & Functionalities</h2>

EndPointer offers a wide range of capabilities aimed at simplifying the process of finding and analyzing endpoints across webpages and JavaScript files. Designed with flexibility and ease of use in mind, this tool allows users to control parsing behavior, interact with results, and dynamically capture changes in web content. Whether you need real-time updates or manual control, EndPointer provides the tools necessary to streamline the process of endpoint discovery and security analysis.

Key Features:

| Key Feature | Description |
| ----------- | ----------- |
| **URL/Endpoint Parsing:** | Extracts URLs from the current webpage and externally linked JavaScript files.|
| **Dynamic Script Loading:** | Automatically parses dynamically loaded script tags upon initial load. |
| **Auto Parsing:** | Automatically triggers parsing when the document is fully loaded. |
| **Manual Parsing:** | Provides the option to manually trigger parsing using the "REPARSE" button. |
| **Scope Declaration:** | Allows users to define parsing scope based on the second-level domain (SLD) and top-level domain (TLD), or individual subdomains. |
| **Concurrent Request Setting:** | Configures the number of concurrent requests to optimize performance during scans. |
| **Interactive UI:** | Offers multiple interface options, including DevTools, popups, and web page interactions. |
| **Interactivity with URLs:** | Search, filter, view code snippets, and inspect responses for each URL. |
| **Output Results:** | Provides different viewing formats, such as Default View and Tree View, for better clarity. |
| **Output Saving:** | Export results in TXT, CSV, or raw unmodified formats for further analysis. |
| **Dynamic Loading/Live Updating:** | URL results and counts are updated in real-time without requiring page refreshes. |
| **CSP friendly:** | Compatible with web apps with strict CSP policies. |
| **Browser States:** | Can parse URLs in an authenticated state or states relying the use of local storage and indexeddb. |

<br>

<a name="Development"></a>
<h2><img src="https://github.com/user-attachments/assets/6f0ac000-6590-47e4-83ea-776fb27ca1fb" width="30"> Developments & Fixes</h2>

We are committed to consistently improving this tool with regular updates and welcome contributions from the community to enhance its functionality. That’s why we’ve made it open source, enabling individuals to contribute their improvements. Here are some of the latest developments and fixes:

Developments:
  - [ ] Development 1
  - [ ] Development 2
  - [ ] Development 3

Fixes:
  - [ ] Fixe 1
  - [ ] Fixe 2
  - [ ] Fixe 3

<br>

<a name="Contributors"></a>
<h2><img src="https://github.com/user-attachments/assets/e4c573d8-62cb-42e1-a95e-b20264e5e2bb" width="30"> Contributors</h2>

This tool has been developed in-house by Interloper Security Group, a loose knit collection of developers and cybersecurity specialists.
The tool has benefited from the invaluable contributions of individuals who have helped enhance specific features and functionality. We would like to acknowledge and thank those who have generously offered their expertise and support. Your efforts have played a key role in making this tool more robust and effective.

Creators / Developers:
- <p><a href="https://github.com/AtlasWiki">AtlasWiki / mrunoriginal</a> <a href="https://www.linkedin.com/in/nathan-w-76ba78202/"><img height="20" src="https://cdn2.iconfinder.com/data/icons/social-icon-3/512/social_style_3_in-306.png"/></a> <a href="https://github.com/AtlasWiki"><img height="20" src="https://github.com/user-attachments/assets/6bb139a7-b21a-4d05-ae32-1eedab692041"/></a> <a href="https://discord.com/"><img height="20" src="https://github.com/user-attachments/assets/c34d7a96-88dd-4d05-806d-4993c3a1917e"/></a></p>
- <p><a href="https://github.com/LordCat">LordCat / Dooma</a> <a href="https://www.linkedin.com/in/kristian-alex-kelly/"><img height="20" src="https://cdn2.iconfinder.com/data/icons/social-icon-3/512/social_style_3_in-306.png"/></a> <a href="https://github.com/LordCat"><img height="20" src="https://github.com/user-attachments/assets/6bb139a7-b21a-4d05-ae32-1eedab692041"/></a>  <a href="https://discord.com/"><img height="20" src="https://github.com/user-attachments/assets/525f3024-68c7-4d6d-adab-4eb21d655743"/></a></p>

Contributors:
- <p><a href="https://github.com/Hacking-Notes">Hacking Notes</a> <a href="https://www.linkedin.com/in/alexis-savard/"><img height="20" src="https://cdn2.iconfinder.com/data/icons/social-icon-3/512/social_style_3_in-306.png"/></a> <a href="https://github.com/Hacking-Notes"><img height="20" src="https://github.com/user-attachments/assets/6bb139a7-b21a-4d05-ae32-1eedab692041"/></a> <a href="https://discord.com/"><img height="20" src="https://github.com/user-attachments/assets/1afd8d87-50fb-49b0-93a7-11a93dfed826"/></a></p>

<br>

How to contribute: 
1. Clone the repo
2. Create a branch called Contribution/{feature name}
3. Send a pull request to this repo with your changes from Contribution/{feature name}

<br>

## Disclaimer
The tool provided on this GitHub page is intended for educational and research purposes only. The creators and maintainers of this tool are not responsible for any misuse or illegal use of the tool. It is the responsibility of the users to ensure that they comply with all applicable laws and regulations while using the tool.
