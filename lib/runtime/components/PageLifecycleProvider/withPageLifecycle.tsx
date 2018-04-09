import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as H from 'history'

import { PageProps } from './PageLifecycleProvider'
import { PageLifecycle } from './PageLifecycle'
import { Logger } from '../../universal'
import { getDisplayName } from '../../util/getDisplayName'

export type LifecycleComponent<T> =
    | React.ComponentClass<PageLifecycleProps & T>
    | React.SFC<PageLifecycleProps & T>

export type LoadingStates = 'loading' | 'loaded'

export type LifecycleState = {
    currentPageState: LoadingStates
    currentPageLocation: H.Location
}
export type PageLifecycleProps = LifecycleState & PageProps

export type StateChangeCallback = (state: LifecycleState) => void
export type RouteChangeCallback = (location: H.Location) => void

export const withPageLifecycleEvents = (Component: React.ComponentClass<any>) => {
    Component.contextTypes = {
        ...Component.contextTypes,
        pageLifecycle: PropTypes.object,
    }

    return Component
}

export function withPageLifecycleProps<T>(
    Component: LifecycleComponent<T>,
): React.ComponentClass<T> {
    return class WithPageLifecycleProps extends React.Component<T, LifecycleState> {
        static displayName = `withPageLifecycleProps(${getDisplayName(Component)})`

        static contextTypes = {
            pageLifecycle: PropTypes.object,
            logger: PropTypes.object,
        }

        context: {
            pageLifecycle: PageLifecycle
            logger: Logger | undefined
        }

        state: LifecycleState

        constructor(props: T, context: { pageLifecycle: PageLifecycle }) {
            super(props, context)

            if (!context) {
                return
            }
            this.state = {
                currentPageState: context.pageLifecycle.currentPageState,
                currentPageLocation: context.pageLifecycle.currentPageLocation,
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

        pageStateChanged = (pageState: LifecycleState) => {
            if (this.context.logger) {
                this.context.logger.trace(
                    {
                        currentPageState: pageState.currentPageState,
                        currentPageLocation: pageState.currentPageLocation,
                    },
                    'Setting pageState on WithPageLifecycle',
                )
            }
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
