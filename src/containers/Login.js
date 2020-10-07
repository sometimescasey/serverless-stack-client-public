import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import { Auth } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";
import { useFormFields } from "../libs/hooksLib";
import { onError } from "../libs/errorLib";
import LoaderButton from '../components/LoaderButton';
import Confirmation from './Confirmation';
import "./Login.css";

export default function Login() {
    const { setIsAuthenticated } = useAppContext();
    const history = useHistory();
    const [ fields, handleFieldChange ] = useFormFields({
        email: "",
        password: "",
    });
    const [ isLoading, setIsLoading ] = useState(false);
    const [ tryConfirmAgain, setTryConfirmAgain ] = useState(false);
    const [ loginError, setLoginError] = useState(null);

    function setLoginErrorText (msg) {
        const loginError = (
            <div>
            {msg}<br/>
            {
                <button
                className="text-button"
                onClick={(e) => {
                    e.preventDefault();
                    history.push('/signup');
                    // TODO: populate email with the prev one
                    }}>
                    Click here
                </button>
            }
            &nbsp;to sign up.
            </div>
        );
        setLoginError(loginError);
    }
    
    function validateForm() {
        return fields.email.length > 0 && fields.password.length > 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        try {
            await Auth.signIn(fields.email, fields.password);
            setIsAuthenticated(true);
        } catch (e) {
            if (e.message === 'User is not confirmed.') {
                setTryConfirmAgain(true);
                setIsLoading(false);
            } else {
                if (e.message) {
                    setLoginErrorText(e.message);
                } else {
                    onError(e);
                }
                setIsLoading(false);
            }
        }
    }

    const loginForm = (
        <div className="Login">
            <form onSubmit={handleSubmit}>
                <FormGroup controlId="email" bsSize="large">
                    <ControlLabel>Email</ControlLabel>
                    <FormControl
                        autoFocus
                        type="email"
                        value={fields.email}
                        onChange={handleFieldChange}
                    ></FormControl>
                </FormGroup>
                <FormGroup controlId="password" bsSize="large">
                    <ControlLabel>Password</ControlLabel>
                    <FormControl              type="password"
                        value={fields.password}
                        onChange={handleFieldChange}
                    ></FormControl>
                </FormGroup>
                <LoaderButton 
                    block
                    type="submit"
                    bsSize="large"
                    isLoading={isLoading}
                    disabled={!validateForm()} >
                    Login
                </LoaderButton>
                {
                loginError && 
                <div className="Login error-message">
                    {loginError}
                </div>
            }
            </form>
        </div>
    );

    return (tryConfirmAgain ? 
    
        <Confirmation email={fields.email} password={fields.password}/> 
        : loginForm);
}
