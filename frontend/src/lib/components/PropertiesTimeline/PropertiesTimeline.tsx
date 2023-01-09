import { Properties } from '@posthog/plugin-scaffold'
import { PropertiesTable } from 'lib/components/PropertiesTable'
import { useActions, useValues } from 'kea'
import { LemonDivider } from '@posthog/lemon-ui'
import { propertiesTimelineLogic, PropertiesTimelineProps } from './propertiesTimelineLogic'
import { TimelineSeekbar } from '../TimelineSeekbar'
import { Tooltip } from '../Tooltip'
import { IconInfo } from '../icons'
import { humanList } from 'lib/utils'
import { teamLogic } from 'scenes/teamLogic'

export function PropertiesTimeline({ actor, filter }: PropertiesTimelineProps): JSX.Element {
    const logic = propertiesTimelineLogic({ actor, filter })
    const { points, crucialPropertyKeys, dateRange, resultLoading, selectedPointIndex } = useValues(logic)
    const { setSelectedPointIndex } = useActions(logic)
    const { currentTeam } = useValues(teamLogic)

    if (currentTeam && !currentTeam.person_on_events_querying_enabled) {
        throw new Error('Properties timeline is irrelevant if persons-on-events querying is disabled')
    }

    const propertiesShown: Properties =
        points.length > 0 && selectedPointIndex !== null ? points[selectedPointIndex].properties : actor.properties

    return (
        <div className="flex flex-col px-2">
            <TimelineSeekbar
                points={
                    crucialPropertyKeys.length > 0 && points
                        ? points.map(({ timestamp, relevantEventCount }) => ({
                              timestamp,
                              count: relevantEventCount,
                          }))
                        : []
                }
                note={
                    <>
                        <span>
                            {crucialPropertyKeys.length > 0
                                ? 'Key person properties over time'
                                : 'No key person properties'}
                        </span>
                        {!resultLoading && (
                            <Tooltip
                                title={
                                    crucialPropertyKeys.length > 0
                                        ? `Person ${
                                              crucialPropertyKeys.length === 1 ? 'property' : 'properties'
                                          } ${humanList(crucialPropertyKeys.map((key) => `\`${key}\``))} ${
                                              crucialPropertyKeys.length === 1 ? 'is' : 'are'
                                          } relevant to this insight's results, because ${
                                              crucialPropertyKeys.length === 1 ? "it's" : "they're"
                                          } used in its query definition. This timeline higlights how ${
                                              crucialPropertyKeys.length === 1
                                                  ? 'that key property has'
                                                  : 'those key properties have'
                                          } been changing within this data point's timeframe.`
                                        : "This insight doesn't rely on any person properties in its query definition. If it did, a timeline showing the values of those key properties would be shown here."
                                }
                            >
                                <IconInfo className="ml-1 text-muted text-xl shrink-0" />
                            </Tooltip>
                        )}
                    </>
                }
                selectedPointIndex={selectedPointIndex}
                onPointSelection={setSelectedPointIndex}
                dateRange={dateRange}
                loading={resultLoading}
            />
            <LemonDivider className="h-0" />
            <PropertiesTable
                properties={propertiesShown}
                nestingLevel={1}
                highlightedKeys={crucialPropertyKeys}
                sortProperties
            />
        </div>
    )
}