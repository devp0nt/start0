import type { ClientActionLog } from '@/general/src/actionLog/utils.server.js'
import { toHumanActionLogAction } from '@/general/src/actionLog/utils.shared.js'
import { getTextPreview } from '@/general/src/other/textPreview.js'
import { Code } from '@/webapp/src/components/other/Code/index.js'
import { getRoute } from '@/webapp/src/lib/routes.js'
import { trpc } from '@/webapp/src/lib/trpc.js'
import { formatDate } from 'date-fns/format'
import React, { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import css from './index.module.scss'

const ActionLog = ({ actionLog }: { actionLog: ClientActionLog }) => {
  const [expanded, setExpanded] = useState(false)

  const relatedItems = [{ user: actionLog.user }, { admin: actionLog.admin }, { project: actionLog.project }]

  return (
    <div className={css.actionLog}>
      <div className={css.header}>
        <span className={css.date}>{formatDate(actionLog.createdAt, 'dd.MM.yyyy HH:mm:ss')}</span>,{' '}
        <span
          className={css.action}
          onClick={() => {
            setExpanded(!expanded)
          }}
        >
          {toHumanActionLogAction(actionLog.action)}
        </span>
        {relatedItems.map((relatedItem) => {
          const text = getTextPreview(relatedItem)
          const url = getRoute({ ...relatedItem, viewerType: 'admin' })
          if (!url && !text) {
            return null
          }
          if (!url) {
            return (
              <React.Fragment key={text}>
                , <span>{text}</span>
              </React.Fragment>
            )
          }
          if (!text) {
            return (
              <React.Fragment key={url}>
                ,{' '}
                <a className={css.related} href={url}>
                  {url}
                </a>
              </React.Fragment>
            )
          }
          return (
            <React.Fragment key={text}>
              ,{' '}
              <a className={css.related} href={url}>
                {text}
              </a>
            </React.Fragment>
          )
        })}
      </div>
      {!expanded && !!actionLog.data && Object.getOwnPropertyNames(actionLog.data).length > 0 && (
        <div className={css.data}>
          <Code data={actionLog.data} />
        </div>
      )}
      {expanded && (
        <div className={css.data}>
          <Code data={actionLog} />
        </div>
      )}
    </div>
  )
}

export const ActionLogs = ({ projectId }: { projectId?: string }) => {
  const queryResult = trpc.getActionLogsForAdmin.useInfiniteQuery(
    { projectId },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor
      },
      refetchOnMount: true,
    }
  )
  const actionLogs = queryResult.data?.pages.flatMap((page) => page.actionLogs) || []
  if (queryResult.isFetching) {
    return <p>Loading...</p>
  }
  if (!actionLogs.length) {
    return <p>Result is empty</p>
  }

  return (
    <InfiniteScroll
      threshold={250}
      loadMore={() => {
        if (!queryResult.isFetchingNextPage && queryResult.hasNextPage) {
          void queryResult.fetchNextPage()
        }
      }}
      className={css.actionLogs}
      hasMore={queryResult.hasNextPage}
      loader={queryResult.hasNextPage ? <p key="loader">Loading...</p> : undefined}
    >
      {actionLogs.map((actionLog) => {
        return <ActionLog actionLog={actionLog} key={actionLog.id} />
      })}
    </InfiniteScroll>
  )
}
