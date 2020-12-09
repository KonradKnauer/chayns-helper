import React, {FunctionComponent, JSXElementConstructor, memo, ReactChildren} from 'react';
import useRefresh from '../../utils/useRefresh';

const Refresh: FunctionComponent<{
    interval?: number,
    children?: ReactChildren;
    elementType?: string|JSXElementConstructor<any>
}> = (
    {
        interval = 10000,
        children,
        elementType = 'div',
        ...props
    }
) => {
    const [refreshId] = useRefresh(interval);
    const Component = elementType;

    return (
        <Component id={refreshId} {...props}>
            {children}
        </Component>
    );
};

Refresh.displayName = 'RefreshComponent';

export default memo(Refresh);