import React, { useEffect, useState, useRef } from "react";
import browser from "webextension-polyfill";
import "./App.css";
import { MessageResponse } from "../constants/message_types";
import Logo from "../../dist/icons/EndPointer.png";

interface AppState {
  urlParser: boolean;
  urlCount: number;
  jsFileCount: number;
  scopes: string[];
  reqAmt: number;
}

function PopUpApp() {
  const [state, setState] = useState<AppState>({
    urlParser: false,
    urlCount: 0,
    jsFileCount: 0,
    scopes: [],
    reqAmt: 1,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    updateAllState();

    const listener = (changes: {
      [key: string]: browser.Storage.StorageChange;
    }) => {
      if (changes.autoParserEnabled) {
        setState((prevState) => ({
          ...prevState,
          urlParser: changes.autoParserEnabled.newValue as boolean,
        }));
      }
    };

    browser.storage.onChanged.addListener(listener);

    return () => {
      browser.storage.onChanged.removeListener(listener);
    };
  }, []);

  const updateAllState = async () => {
    try {
      const [autoParserState, scopeResult, reqAmtResult] = await Promise.all([
        browser.runtime.sendMessage({
          action: "getAutoParserState",
        }) as Promise<MessageResponse>,
        browser.storage.local.get("scope"),
        browser.storage.local.get("requests"),
      ]);

      setState((prevState) => ({
        ...prevState,
        urlParser: autoParserState.state ?? false,
        scopes: (scopeResult.scope as string[]) || [],
        reqAmt: (reqAmtResult.requests as number) || 1,
      }));

      // Only update URL and JS file counts if there's an active tab
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]?.id) {
        const [urlCount, jsFileCount] = await Promise.all([
          browser.tabs.sendMessage(tabs[0].id, { action: 'countURLs' }) as Promise<MessageResponse>,
          browser.tabs.sendMessage(tabs[0].id, { action: 'countJSFiles' }) as Promise<MessageResponse>,
        ]);

        setState(prevState => ({
          ...prevState,
          urlCount: urlCount.count ?? 0,
          jsFileCount: jsFileCount.count ?? 0,
        }));
      }
    } catch (error) {
      console.error("Failed to update state:", error);
    }
  };

  const handleAction = async (action: string, payload?: any) => {
    try {
      const tabs = await browser.tabs.query({active: true, currentWindow: true});
      if (tabs[0]?.id) {
        const response = await browser.tabs.sendMessage(tabs[0].id, { action, ...payload }) as MessageResponse;
        if (!response.success) {
          throw new Error(response.error);
        }
        await updateAllState();
      }
    } catch (error) {
      console.error(`Error in ${action}:`, error);
    }
  };

  const parseURLs = () => handleAction("reparse");
  const clearURLs = () => handleAction("clearURLs");
  const countURLs = () => handleAction("countURLs");

  useEffect(() => {
    const handleChange = () => {
      countURLs();
    };
    browser.storage.onChanged.addListener(handleChange);
    return () => {
      browser.storage.onChanged.removeListener(handleChange);
    };
  }, []);

  const toggleUrlParserState = async () => {
    const newState = !state.urlParser;
    const response = await browser.runtime.sendMessage({ action: 'setAutoParserState', state: newState }) as MessageResponse;
    if (response.success) {
      setState(prevState => ({ ...prevState, urlParser: newState }));
    }
  };

  const handleAddScope = () => {
    const newScope = inputRef.current?.value;
    if (newScope) {
      setState(prevState => {
        const updatedScopes = [...prevState.scopes, newScope];
        browser.storage.local.set({ scope: updatedScopes });
        return { ...prevState, scopes: updatedScopes };
      });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemoveScope = (scopeToRemove: string) => {
    setState(prevState => {
      const updatedScopes = prevState.scopes.filter(scope => scope !== scopeToRemove);
      browser.storage.local.set({ scope: updatedScopes });
      return { ...prevState, scopes: updatedScopes };
    });
  };

  const handleReqAmt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newReqAmtValue = Number(e.target.value);
    setState(prevState => ({ ...prevState, reqAmt: newReqAmtValue }));
    browser.storage.local.set({ requests: newReqAmtValue });
    console.log(`set requests to ${newReqAmtValue}`);
  };

  const clearCache = async () => {
    await browser.storage.local.clear();
    alert("Cache cleared");
    updateAllState();
  };

  const clearAllScopes = () => {
    browser.storage.local.set({scope: []});
    setState(prevState => ({ ...prevState, scopes: [] }));
  };

  // UI Components
  const DisplayState: React.FC<{ state: boolean }> = ({ state }) => (
    <div className="flex">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill={state ? "#82e467" : "#e63946"}
            d="M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12"
          />
        </svg>
        <span
          className={
            state
              ? "text-white  font-semibold"
              : "text-customFont  font-semibold"
          }
        >
          {state ? "ON" : "OFF"}
        </span>
      </div>
    </div>
  );

  const DisplayScope: React.FC<{ scope: string; onRemove: () => void }> = ({
    scope,
    onRemove,
  }) => {
    return (
      <div className="flex justify-between items-center gap-3">
        <span className="text-white py-1 px-1">{scope}</span>
        <button className="text-center pl-1 bg-transparent text-rose-500" onClick={onRemove}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path fill="#df4950" d="M19 12.998H5v-2h14z" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-customBg w-full md:h-screen m-0  md:justify-center py-5 px-3">
      <div className="text-center">
        <div className="flex">
          <div className="flex gap-3 justify-center mb-5">
            <img src={Logo} style={{ width: "12%", height: "77%" }} />
            <h1 className="text-3xl text-customRed font-bold md:text-6xl mb-1">
              EndPointer
            </h1>

          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 items-center w-full mx-0">
          <div className="flex flex-col gap-2 md:gap-5 w-full">
            <button className=" w-full font-semibold border-2 rounded-sm p-2 border-customFont bg-gradient-to-r from-customFont to-customBg text-white">
              <span className="text-white">URLs</span> ({state.urlCount})
            </button>
            <div className="text-md flex w-full gap-2 ">
              <button
                className=" p-2 rounded-sm w-[50%] border-2 border-customFont  bg-customFont flex justify-center items-center"
                onClick={clearURLs}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="#e96c4c"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
                  />
                  <title>Delete URLs</title>
                </svg>
              </button>
              <button
                className=" p-2 rounded-sm w-[50%] bg-customBg border-2 border-customFont flex justify-center items-center"
                onClick={clearCache}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#FFFFFF"
                    d="M5.505 9.117a7.7 7.7 0 0 1-1.497-.852V12c0 .524.473 1.23 1.8 1.883c1.267.625 3.085 1.071 5.18 1.182a.76.76 0 0 1-.08 1.517c-2.242-.118-4.274-.598-5.772-1.336a7.3 7.3 0 0 1-1.128-.68V18.3c0 .282.127.61.476.973c.352.366.899.732 1.633 1.055c1.466.645 3.545 1.063 5.881 1.063q.867 0 1.683-.074a.76.76 0 0 1 .135 1.513a21 21 0 0 1-1.818.08c-2.496 0-4.792-.443-6.493-1.192c-.849-.374-1.584-.838-2.117-1.393c-.536-.558-.9-1.244-.9-2.025V5.7c0-.782.364-1.467.9-2.025c.533-.555 1.268-1.02 2.117-1.393c1.7-.749 3.997-1.193 6.493-1.193s4.793.444 6.493 1.193c.85.373 1.585.838 2.117 1.393c.537.558.9 1.243.9 2.025s-.363 1.467-.9 2.025c-.532.554-1.267 1.02-2.117 1.393c-1.7.748-3.996 1.192-6.493 1.192c-2.496 0-4.792-.444-6.493-1.192Zm-1.021-4.39c-.35.362-.476.69-.476.972s.127.61.476.972c.352.367.899.732 1.633 1.055c1.466.646 3.545 1.064 5.881 1.064s4.415-.418 5.882-1.064c.734-.323 1.28-.688 1.633-1.055c.35-.363.476-.69.476-.972s-.127-.61-.476-.973c-.353-.367-.9-.732-1.633-1.055c-1.467-.645-3.545-1.063-5.882-1.063s-4.415.418-5.88 1.063c-.735.323-1.282.688-1.634 1.055Z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M21.425 11.11a.5.5 0 0 0-.881-.418l-5.438 6.937a.5.5 0 0 0 .394.808h3.268l-.945 4.46a.5.5 0 0 0 .888.405l4.688-6.188a.5.5 0 0 0-.399-.802h-2.745z"
                  />
                  <title>Delete Cache</title>
                </svg>
              </button>
            </div>
          </div>
          <div className="flex w-full mb-3 gap-2 justify-content items-center">
            <a
              href={document.location.origin + "/PopUp/popup.html#urls"}
              target="_blank"
              className=" p-2 rounded-sm w-[50%] bg-customFont border-2 border-customFont flex justify-center items-center text-white"
            >
              Panel
            </a>
            <button
              className=" p-2 rounded-sm w-[50%] bg-customBg border-2 text-white border-customFont flex justify-center items-center"
              onClick={parseURLs}
            >
              REPARSE
            </button>
          </div>
        </div>
      </div>

      <div className="w-full text-center flex flex-col justify-center items-center">
        {/* <hr className="w-full border-gray-400/60 mb-5" /> */}
        <h1 className="text-2xl text-customRed font-semibold mb-2">
          Auto Parser
        </h1>
        <p className="text-white mb-2">Auto parses after page load</p>
        <div className="mb-2">
          <button
            className="bg-customBg border-2 border-customBg p-2"
            onClick={toggleUrlParserState}
          >
            <DisplayState state={state.urlParser} />
          </button>
        </div>
      </div>

      <div className="w-full text-center flex flex-col justify-center items-center">
        {/* <hr className="w-full border-gray-400/60 mb-5" /> */}
        <h1 className="text-2xl text-customRed font-semibold mb-2">
          Concurrent Requests
        </h1>
        <p className="text-white">
          A request of 1 is recommended for higher accuracy when dealing with
          big web apps with many dynamic js files
        </p>
        <div className="mb-3">
          <div className="mt-5 mb-1">
            <span className="w-full py-1 px-3 text-white bg-customFont font-semibold rounded-sm">
              {state.reqAmt}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={state.reqAmt}
            onChange={handleReqAmt}
            className="mt-1 w-64 h-2 mb-3 bg-customFont rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="w-full text-center flex flex-col justify-center items-center p-6  rounded-lg shadow-lg">
  <h1 className="text-3xl text-customRed font-semibold mb-4">SCOPE</h1>
  <div className="flex gap-1 items-center">
    <p className="text-gray-300 w-full mb-3 text-sm">
      Keep scope empty if you want to parse from all scopes
    </p>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="text-gray-500 hover:text-blue-400 cursor-pointer"
    >
      <path
        fill="currentColor"
        d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412l-1 4.705c-.07.34.029.533.304.533c.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598c-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081l.082-.381l2.29-.287zM8 5.5a1 1 0 1 1 0-2a1 1 0 0 1 0 2"
      />
                  <title>
              You can either specify SLD + TLD (example.com) or subdomains
              (www.example.com). For example, example.com would cover all
              subdomains (all other hosts belonging to example.com like
              help.example.com) while www.example.com only covers one
              host/domain. Or scope can be left empty to parse all web apps you
              go to.
            </title>
    </svg>
  </div>
  <div className="flex items-center justify-center w-full gap-2 mt-4">
    <input
      type="text"
      ref={inputRef}
      className="w-full border-gray-600 text-gray-200 outline-none border-2 py-2 rounded-sm px-3 bg-gray-800 placeholder-gray-500 transition duration-200 focus:border-2 focus:border-customFont focus:ring "
      placeholder="example.com or www.example.com"
    />
    <button
      className="bg-customFont text-white rounded-sm py-1 px-2 font-bold transition duration-200 hover:bg-blue-600 focus:outline-none focus:ring focus:border-2 focus:border-customFont"
      onClick={handleAddScope}
    >
      +
    </button>
  </div>

  <div className="flex w-full justify-between gap-2 mt-6">
    <div className="flex w-full text-center border-2 border-gray-600 overflow-auto h-20 pb-5 rounded-sm bg-gray-800 shadow-inner">
      <div className="mt-5 flex flex-col px-2">
        {state.scopes.map((scope, index) => (
          <DisplayScope
            key={index}
            scope={scope}
            onRemove={() => handleRemoveScope(scope)}
          />
        ))}
      </div>
    </div>

    <button className="mt-14 bg-transparent" onClick={clearAllScopes}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="text-red-500 hover:text-red-400 transition duration-200"
      >
        <path
          fill="currentColor"
          d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
        />
            <title>Clear All</title>
      </svg>
    </button>
  </div>
</div>



      <div>
        <p className="text-customFont mt-8 mb-5 md:text-lg">
          An endpoint parser and extractor with many flexible features by
         <span className="text-white"> <a target="_blank" href="https://www.linkedin.com/in/nathan-w-76ba78202/">  AtlasWiki/mrunoriginal </a></span> and{" "}
          <span className="text-white"><a href="https://www.linkedin.com/in/kristian-alex-kelly/">LordCat</a></span> | Designed by <span className="text-white"><a href="https://www.linkedin.com/in/mahenoor-salat/">Mahenoor</a></span>
        </p>
      </div>

      <div className="flex gap-2 justify-center items-center">
        {/* <h4>  <a href="https://github.com/AtlasWiki/endPointer/" target="_blank"> view on github</a></h4> */}
        <a href="https://github.com/AtlasWiki/endPointer/" target="_blank">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="34"
            viewBox="0 0 24 24"
          >
            <path
              fill="#FFFFFF"
              d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
export default PopUpApp;
