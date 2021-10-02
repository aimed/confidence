import React from "react"
import { render } from "react-dom"
import { EstimatesPage } from "./EstimatesPage"

const App = () => {
  return <EstimatesPage></EstimatesPage>
}

render(<App />, document.getElementById("app"))
