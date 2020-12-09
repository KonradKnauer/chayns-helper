import React, {FunctionComponent, Suspense, useEffect} from 'react';
import showWaitCursor from '../../functions/waitCursor';
import CenteredWaitCursor from './CenteredWaitCursor';

/**
 * SuspenseWaitCursor
 * A suspense component for lazy loading with React.lazy() that displays a waitCursor during the dynamic import.
 * The waitCursor can either be a <SmallWaitCursor/> (inline = true) or a chayns.showWaitCursor (inline = false)
 * @param {Object} props
 * @param {*|*[]} props.children
 * @param {boolean} [props.inline=false] - true: Small inline waitCursor; false: Big chayns overlay waitCursor
 * @return {*}
 * @constructor
 */
const SuspenseWaitCursor: FunctionComponent<{
    inline?: boolean
}> = ({children, inline = false}) => (
    <Suspense fallback={(<SuspenseWaitCursorFallback inline={inline}/>)}>
        {children}
    </Suspense>
);

SuspenseWaitCursor.displayName = 'SuspenseWaitCursor';

export default SuspenseWaitCursor;

const SuspenseWaitCursorFallback: FunctionComponent<{
    inline?: boolean
}> = ({inline = false}) => {
    useEffect(() => {
        if (!inline) {
            return showWaitCursor();
        }
        return () => null;
    }, []);
    return inline ? (<CenteredWaitCursor className="Suspense_placeholder"/>) : (
        <div className="Suspense_placeholder"/>);
};

SuspenseWaitCursorFallback.displayName = 'SuspenseWaitCursorFallback';