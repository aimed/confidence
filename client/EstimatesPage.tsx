import React, { useEffect, useRef } from "react"
import {
  atom,
  useRecoilState,
  useRecoilValue,
  selector,
  selectorFamily,
} from "recoil"
import { useSocket, SocketProvider } from "./useSocket"
import { usernameState } from "./user/usernameState"
import { groupByValue } from "./object"
import { Button, Divider, Spacer } from "./Atoms"
import { UserSettingsForm } from "./user/UserSettingsForm"

export const EstimatesPage = () => (
  <SocketProvider uri="/estimate">
    <InitialSubscription />
    <HiddenStateSubscription />
    <EstimatesSubscription />
    <CurrentUsernameSubscription />
    <main className="layout">
      <EstimatePicker />
      <Sidebar />
    </main>
  </SocketProvider>
)

const CurrentUsernameSubscription = () => {
  const [currentUsername] = useRecoilState(usernameState)
  const socket = useSocket()

  useEffect(() => {
    return () => {
      socket.emit("unset", { username: currentUsername })
    }
  }, [currentUsername])

  useEffect(() => {
    window.localStorage.setItem("username", currentUsername)
  }, [currentUsername])

  return null
}

const useClear = () => {
  const socket = useSocket()
  return () => socket.emit("clear")
}

const useVote = () => {
  const socket = useSocket()
  const [username] = useRecoilState(usernameState)
  return (vote: string) => socket.emit("estimate", { estimate: vote, username })
}

const useUnset = () => {
  const socket = useSocket()
  const [username] = useRecoilState(usernameState)
  return () => socket.emit("unset", { username })
}

const InitialSubscription = () => {
  const socket = useSocket()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      socket.emit("ready", {})
    }, 10)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [socket])

  return null
}

const estimatesState = atom<{ [index: string]: number }>({
  key: "estimatesState",
  default: {},
})

const EstimatesSubscription = () => {
  const socket = useSocket()
  const [, setEstimates] = useRecoilState(estimatesState)

  useEffect(() => {
    socket.on("votes", ({ votes }: any) => setEstimates(votes))
  }, [socket])

  return null
}

const hiddenState = atom({
  default: true,
  key: "hiddenState",
})

const HiddenStateSubscription = () => {
  const socket = useSocket()
  const [hidden, setHidden] = useRecoilState(hiddenState)
  const knownHiddenState = useRef(hidden)

  useEffect(() => {
    socket.on("hidden", ({ hidden: serverHidden }: any) => {
      knownHiddenState.current = serverHidden
      setHidden(serverHidden)
    })
  }, [socket])

  useEffect(() => {
    if (knownHiddenState.current !== hidden) {
      knownHiddenState.current = hidden
      socket.emit("hide", { hidden })
    }
  }, [hidden])

  return null
}

const ClearAllAndHideButton = () => {
  const clear = useClear()
  const [, setHidden] = useRecoilState(hiddenState)

  const handler = () => {
    clear()
    setHidden(true)
  }

  return (
    <Button variant="destructive" onClick={handler}>
      Clear All & Hide
    </Button>
  )
}

const isEstimateSelectedState = selectorFamily({
  key: "isEstimateSelectedState",
  get:
    (value) =>
    ({ get }) => {
      const username = get(usernameState)
      const estimates = get(estimatesState)
      const selectedByUser = estimates[username]
      return selectedByUser === value
    },
})

const ValueButton: React.FC<{ value: string }> = ({ value }) => {
  const isSelected = useRecoilValue(isEstimateSelectedState(value))
  const onSelect = useVote()
  const onUnset = useUnset()
  const onClick = () => (isSelected ? onUnset() : onSelect(value))
  const variant = isSelected ? "selected" : "unselected"

  return (
    <button
      className={`estimate estimate--${variant} shadow`}
      onClick={onClick}
    >
      <span className="estimate__inner">{value}</span>
    </button>
  )
}

const EstimatePicker = () => {
  return (
    <div className="estimate-picker">
      {estimateValues.map((value) => (
        <ValueButton value={value} key={value} />
      ))}
    </div>
  )
}

const VoteCount = () => {
  const [estimates] = useRecoilState(estimatesState)
  const estimatesByValue = groupByValue(estimates)
  const estimatesWithVotesSorted = Object.entries(estimatesByValue).sort(
    (entry1, entry2) => entry2[1].length - entry1[1].length
  )

  return (
    <>
      {estimatesWithVotesSorted.length === 0 && (
        <div className="text-lg text-center">No votes :(</div>
      )}
      {estimatesWithVotesSorted.map((entry) => {
        const [value, votes] = entry
        const votesCount = votes.length

        return (
          <React.Fragment key={value}>
            <div className="text-lg text-center">
              -{value}- ({votesCount})
            </div>
            <div>{votes.join(", ")}</div>
          </React.Fragment>
        )
      })}
    </>
  )
}

const voteStatisticsState = selector({
  key: "voteStatisticsState",
  get: ({ get }) => {
    const estimates = get(estimatesState)
    const votes = Object.values(estimates)
    const voteCount = votes.length

    return {
      voteCount,
    }
  },
})

const HideButton = () => {
  const [hidden, setHidden] = useRecoilState(hiddenState)

  return (
    <Button onClick={() => setHidden(!hidden)}>
      {hidden ? "Show Results" : "Hide Results"}
    </Button>
  )
}

const Sidebar = () => {
  const { voteCount } = useRecoilValue(voteStatisticsState)
  const hidden = useRecoilValue(hiddenState)

  return (
    <div className="sidebar">
      <h2 className="text-lg text-center">Settings</h2>
      <Spacer />
      <UserSettingsForm />
      <Spacer />
      <Spacer />

      <h1 className="text-lg text-center">Estimates</h1>
      <Spacer />
      <HideButton />
      <Spacer />
      <ClearAllAndHideButton />

      <Divider />
      <div className="text-lg text-center ">
        # Votes: <span key={voteCount}>{voteCount}</span>
      </div>
      {hidden ? null : (
        <div>
          <Divider />
          <VoteCount />
        </div>
      )}
    </div>
  )
}

const estimateValues = [
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "20",
  "40",
  "100",
  "∞",
  "?",
]
