import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import MantineShell from "../../Components/Base/MantineShell";
import FinalBowser from "../Final-Bowser/FinalBowser";

export default function Home() {
    let router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<MantineShell/>}>
                <Route path="home" element={<div>asd</div>}/>
                <Route path="final-bowser" element={<FinalBowser/>}/>
            </Route>
        ), {basename: "/pm64"}
    )

    return (
        <RouterProvider router={router} />
    )
}