import React from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useAppContext } from "../libs/contextLib";

export default function AuthenticatedRoute({children, ...props}) {
    const { pathname, search } = useLocation();
    const { isAuthenticated } = useAppContext();

    return (
        <Route {...props}>
         {isAuthenticated ?
             (children) :
             (<Redirect to={
                 `/login?redirect=${pathname}${search}`}/>)
         }
        </Route>
    );
}
