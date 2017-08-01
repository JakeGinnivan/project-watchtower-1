import * as React from 'react'
import * as PropTypes from 'prop-types'
import { withRouter, RouteComponentProps } from 'react-router'
import * as H from 'history'
import { PageLifecycle } from './PageLifecycle'

export interface PageLifecycleEvent<T> {
    type: string
    timeStamp: number
    originator: string
    payload: T
}
export declare type Properties = {
    [key: string]: any;
}
export interface PageLoadStarted extends PageLifecycleEvent<Properties> {
    type: 'page-load-started'
}

export interface PageLoadFailed extends PageLifecycleEvent<Properties & { error: string }> {
    type: 'page-load-failed'
}

export interface PageLoadComplete extends PageLifecycleEvent<Properties> {
    type: 'page-load-complete'
}

export type PageEvent = PageLoadStarted | PageLoadFailed | PageLoadComplete

export interface PageProps {
    /** Increments loading count */
    beginLoadingData: () => void
    /** Decrements loading count */
    endLoadingData: () => void
}

export interface OwnProps {
    render: React.ReactElement<any> | ((pageProps: PageProps) => React.ReactElement<any>)
    onEvent: (event: PageEvent) => void
}

type Props = OwnProps & RouteComponentProps<{}>

export type LoadingStates = 'loading' | 'loaded'

export type LifecycleState = {
    currentPageState: LoadingStates,
    currentPageLocation: string,
}
export type PageLifecycleProps = LifecycleState & PageProps

export type StateChangeCallback = (state: LifecycleState) => void
export type RouteChangeCallback = (location: H.Location) => void

// tslint:disable-next-line:max-classes-per-file
export class ComponentWithLifecycle<P, S> extends React.Component<P & PageLifecycleProps, S> {
    context: {
        pageLifecycle: PageLifecycle,
    }
}

type LifecycleComponent<T> =
 | React.ComponentClass<PageLifecycleProps & T>
 | React.SFC<PageLifecycleProps & T>

// tslint:disable-next-line:max-line-length
// tslint:disable-next-line:only-arrow-functions
export const withPageLifecycleProps = function<T>(Component: LifecycleComponent<T>): React.ComponentClass<T> {
    // tslint:disable-next-line:max-classes-per-file
    return class WithPageLifecycleProps extends React.Component<T, LifecycleState> {
        static contextTypes = {
            pageLifecycle: PropTypes.object,
        }

        context: {
            pageLifecycle: PageLifecycle,
        }

        state: LifecycleState

        constructor(props: T, context: { pageLifecycle: PageLifecycle }) {
            super(props, context)

            this.state = {
                currentPageState: context.pageLifecycle
                    ? context.pageLifecycle.currentPageState
                    : 'loading',
                currentPageLocation: context.pageLifecycle
                    ? context.pageLifecycle.currentPageLocation
                    : '',
            }
        }

        componentWillMount() {
            if (!this.context.pageLifecycle) {
                return
            }
            this.context.pageLifecycle.onPageStateChanged(this.pageStateChanged)
        }

        componentWillUnmount() {
            this.context.pageLifecycle.offPageStateChanged(this.pageStateChanged)
        }

        pageStateChanged = (pageState: PageLifecycleProps) => {
            this.setState(pageState)
        }

        render() {
            return (
                <Component
                    {...this.props}
                    currentPageState={this.state.currentPageState}
                    currentPageLocation={this.state.currentPageLocation}
                    beginLoadingData={this.context.pageLifecycle.beginLoadingData}
                    endLoadingData={this.context.pageLifecycle.endLoadingData}
                />
            )
        }
    }
}

export const withPageLifecycleEvents = (Component: React.ComponentClass<any>) => {
    Component.contextTypes = {
        ...Component.contextTypes,
        pageLifecycle: PropTypes.object,
    }

    return Component
}

// tslint:disable-next-line:max-classes-per-file
class PageLifecycleProvider extends React.Component<Props, {}> {
    static childContextTypes = {
        pageLifecycle: PropTypes.object,
    }

    isRouting: boolean
    loadingDataCount: number
    pageLifecycle: PageLifecycle

    constructor(props: Props) {
        super(props)

        this.isRouting = true
        this.loadingDataCount = 0
        this.pageLifecycle = new PageLifecycle(
            this.onPageRender,
            this.beginLoadingData,
            this.endLoadingData,
            'loading',
            this.props.location.pathname,
        )
    }

    componentWillMount() {
        this.raisePageLoadStartEvent()
    }

    stateChanged = () => {
        const isLoading = this.isRouting || this.loadingDataCount > 0
        const currentPageState = isLoading
                ? 'loading'
                : 'loaded'
        this.pageLifecycle.pageStateChanged({
            currentPageState,
            currentPageLocation: this.props.location.pathname,
        })
    }

    raisePageLoadStartEvent = () => {
        this.stateChanged()
        this.props.onEvent({
            type: 'page-load-started',
            originator: 'PageEvents',
            // TODO Add payload
            payload: {},
            timeStamp: new Date().getTime(),
        })
    }

    raisePageLoadCompleteEvent = () => {
        this.isRouting = false
        this.stateChanged()
        this.props.onEvent({
            type: 'page-load-complete',
            originator: 'PageEvents',
            // TODO Add payload
            payload: {},
            timeStamp: new Date().getTime(),
        })
    }

    onPageRender = () => {
        // We started routing, but no loading data events have fired
        if (this.isRouting && this.loadingDataCount === 0) {
            this.isRouting = false
            this.raisePageLoadCompleteEvent()
        }
    }

    getChildContext() {
        return {
            pageLifecycle: this.pageLifecycle,
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        // We only care about pathname, not any of the other location info
        if (this.props.location.pathname !== nextProps.location.pathname) {
            this.isRouting = true
            this.raisePageLoadStartEvent()
            this.pageLifecycle.routeChanged(nextProps.location)
        }
    }

    beginLoadingData = () => {
        this.loadingDataCount++
    }

    endLoadingData = () => {
        this.loadingDataCount--

        if (this.loadingDataCount === 0) {
            this.raisePageLoadCompleteEvent()
        }
    }

    render() {
        if (typeof this.props.render === 'function') {
            return this.props.render({
                beginLoadingData: this.beginLoadingData,
                endLoadingData: this.endLoadingData,
            })
        }
        return this.props.render
    }
}

export default withRouter(PageLifecycleProvider) as React.ComponentClass<OwnProps>