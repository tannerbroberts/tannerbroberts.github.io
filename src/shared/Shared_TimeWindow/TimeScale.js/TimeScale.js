import { Button } from "@mui/material"
import React from "react"

export default function TimeScale() {
    return (
        <div style={{display: "flex", flexDirection: "row"}}>
            <Button>Seconds</Button>
            <Button>Minutes</Button>
            <Button>Hours</Button>
            <Button>Days</Button>
            <Button>Years</Button>
        </div>
    )
}