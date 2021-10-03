import React from "react"
import { useRecoilState } from "recoil"
import { usernameState } from "./usernameState"
export const UserSettingsForm = () => {
  const [username, setUsername] = useRecoilState(usernameState)

  return (
    <input
      className="input shadow"
      value={username}
      onChange={(event) => setUsername(event.target.value)}
    />
  )
}
