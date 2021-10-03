import "./styles.css"
import React from "react"
import { render } from "react-dom"
import { EstimatesPage } from "./EstimatesPage"
import { RecoilRoot } from "recoil"

const App = () => {
  return <EstimatesPage />
}

render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  document.getElementById("app")
)
