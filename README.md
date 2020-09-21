chayns-helper
===================
This package contains a variety of useful helpers for [chayns](https://github.com/TobitSoftware) development.
Read the comments in the source code for a more detailed description and further information to each asset.
## Initialization
Initialize the helper in your index.js to make sure that every feature actually works:
```javascript
initChaynsHelper({
    textStringPrefix: 'txt_chayns_myapp_', // necessary to use all textString helpers
    requestErrorHandler: myRequestErrorHandler, // default is defaultErrorHandler, used only by handleRequest
    logger: chaynsLogger, // access the chayns logger as it cannot be a dependency for this public package
    useSelector // react-redux useSelector hook, required to use useShallowSelector
});
```

> **_NOTE:_** This package may lack markdown documentations and examples but features JsDoc comments instead. If you would like me to add examples and a readme to a feature, let me know and I'll add them.

## Contents
### Components
| Component                                                                | Description                 |
|--------------------------------------------------------------------------|-----------------------------|
| [CenteredContainer](/src/components/containers/CenteredContainer.jsx)| Centered container |
| [CenteredWaitCursor](/src/components/wait-cursor/CenteredWaitCursor.jsx)| Inline-waitCursor, centered and with padding |
| [DataRow](/src/components/containers/DataRow.jsx)| Container for a row with a label and e.g. a button |
| [ErrorBoundary](/src/components/error-boundary/ErrorBoundary.jsx)| Customizable ErrorBoundary to catch errors during render |
| [refresh](/src/components/other/refresh.jsx)| HOC to rerender a Component in an interval |
| [Refresh](/src/components/other/RefreshComponent.jsx)| Component to rerender its children in an interval |
| [ResizableWaitCursor](/src/components/wait-cursor/ResizableWaitCursor.jsx)| chayns SmallWaitCursor but resizable |
| [RestrictedAccordion](/src/components/restricted-accordion/RestrictedAccordion.jsx)| Accordion with lock-icon for admins |
| [SuspenseWaitCursor](/src/components/wait-cursor/SuspenseWaitCursor.jsx)| Suspense-Component that provides a fallback for React lazy loading |
| [TextStringMemo](/src/textstring/TextStringMemo.jsx)| Memoized Textstring Component, adds prefix. Allows complex replacements with JSX and CTRL+Click to edit |
| [UACGroupChooseButton](/src/components/buttons/UACGroupChooseButton.jsx)| ChooseButton for UAC groups |

### Hooks
| Hook                                                                 | Description                   | Readme |
|----------------------------------------------------------------------|-------------------------------| --------|
| [useAxis](/src/functions/recharts/useAxis.js)| a hook to generate a better recharts axis |
| [useFullscreenTapp](/src/hooks/useFullscreenTapp.js)| Hook to create a fullscreen tapp without scrolling | [useFullscreenTapp.md](/src/hooks/useFullscreenTapp.md) |
| [useTextStrings](/src/textstring/TextStringMemo.jsx)| get memoized TextStrings from a list of string names |
| [useTimeoutState](/src/hooks/uniques/useTimeoutState.js)| useState that calls an onChange method if the value hasn't change for a certain time | [useTimeoutState.md](/src/hooks/uniques/useTimeoutState.md) |
| [useUniqueEventListener](/src/hooks/uniques/useUniqueEventListener.js)| removes an old eventListener when a new one is set |
| [useUniqueInterval](/src/hooks/uniques/useUniqueInterval.js)| clears a previous interval when a new one is set |
| [useUniqueTimeout](/src/hooks/uniques/useUniqueTimeout.js)| clears a previous timeout when a new one is set |
| [useUser](/src/hooks/useUser.js)| chayns.getUser() hook |
| [useWebsocketService](/src/hooks/useWebsocketService.js)| configure a tobit-websocket-service-client | [useWebsocketService.md](/src/hooks/useWebsocketService.md) |
| [useShallowSelector](/src/hooks/useShallowSelector.js)| a useSelector Hook with shallowEqual |

### Functions
| Function                                                                 | Description                   | Readme |
|----------------------------------------------------------------------|-------------------------------|----- |
| [chaynsColors](/src/functions/chaynsColors.js)| a collection of helpers to get chayns colors, color class names as well as mix them and convert them to rgb | |
| [chaynsDialogs](/src/functions/chaynsDialogs.js)| makes using chayns dialogs so much more comfortable | |
| [copyToClipboard](/src/functions/copy.js)| copy a value to the user's clipboard | |
| [defaultErrorHandler](/src/functions/defaultErrorHandler.js)| default request error handling with dialogs for error status codes | |
| [fnsFormat](/src/functions/timeHelper/fnsFormat.js)| date-fns format with option to use today/tomorrow/yesterday and append the year if it's not the current year | |
| [generateAxis](/src/functions/recharts/generateAxis.js)| a function to generate a better recharts axis | |
| [generateUUID](/src/functions/generateUid.js)| generate a GUID | |
| [getHookState](/src/functions/getHookState.js)| get the current state of a hook via the setState function | |
| [Guid](/src/functions/guid.js)| a Guid class | |
| [hideCWFooter](/src/functions/chaynsCalls/chaynsCalls.js)| hide the chayns web footer | |
| [request](/src/functions/httpRequest.js)| fetch helper with loads of options, constants and a try/catch wrapper | [httpRequest.md](/src/functions/httpRequest.md) |
| [localStorage](/src/other/localStorageHelper.js)| helper to cache httpRequest JSON strings in local storage | |
| [setViewMode](/src/functions/chaynsCalls/chaynsCalls.js)| toggle exclusive mode | |
| [shallowEqual](/src/functions/shallowEqual.js)| check 2 values for equality | |
| [types](/src/functions/types.js)| a collection of helpers for types in general but especially objects and arrays. Includes: mapObject, reduceObject, mapObjectToArray, forEachKey, firstOrDefault, replaceAll, type checking | |
| [showWaitCursor](/src/functions/waitCursor.js)| helper for chayns.showWaitCursor with a timeout before displaying ||
| [WebSocketClient](/src/other/WsClient.js)| custom alternative to tobit-websocket-service-client | |

### Constants
| Constant                                                     | Description                   | Readme |
|--------------------------------------------------------------|-------------------------------|----- |
| [statusAnimations](/src/constants/statusAnimations.js) | success and failure animation html string for dialogs | |
| [time](/src/constants/time.js)| constant for times based on ms | |

### Other
| Asset                                                     | Description                   | Readme |
|--------------------------------------------------------------|-------------------------------|----- |
| [chaynsDoc](/src/other/chaynsDoc.js) | A JsDoc documentation of the global chayns Object that enables auto completion in WebStorm | |





