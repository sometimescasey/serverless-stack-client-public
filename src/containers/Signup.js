import React, { useState } from "react";
import { Auth } from 'aws-amplify';
import { useHistory } from "react-router-dom";
import {
    FormGroup,
    FormControl,
    ControlLabel
} from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { useFormFields } from "../libs/hooksLib";
import { onError } from "../libs/errorLib";
import Confirmation from './Confirmation';
import "./Signup.css";

export default function Signup () {
    const [fields, handleFieldChange] = useFormFields({
        email: "",
        password: "",
        confirmPassword: "",
        confirmationCode: "",
    });
    const history = useHistory();
    const [newUser, setNewUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [signupError, setSignupError] = useState(null);

    function validateForm () {
        return (
            fields.email.length > 0 &&
            fields.password.length > 0 &&
            fields.password === fields.confirmPassword
        );
    }

    function setSignupErrorText () {
        const signupError = (
            <div>
            This email is already registered. Please&nbsp;
            {
                <button
                className="text-button"
                onClick={(e) => {
                    e.preventDefault();
                    history.push('/login');
                    // TODO: populate email with the prev one
                    }}>
                    log in
                </button>
            }
            .
            </div>
        );
        setSignupError(signupError);
    }
    
    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        
        try {
            const newUser = await Auth.signUp({
                username: fields.email,
                password: fields.password,
            });
            setIsLoading(false);
            setNewUser(newUser);
        }
        catch (e) {
            if (e.name === 'UsernameExistsException') {
                setSignupErrorText();
            } else {
                onError(e);
            }
            setIsLoading(false);
        }
    }

    function renderForm () {
         return (
            <>
            <form onSubmit={handleSubmit}>
            <FormGroup controlId="email" bsSize="large">
                <ControlLabel>Email</ControlLabel>
                <FormControl
                    autoFocus
                    type="email"
                    value={fields.email}
                    onChange={handleFieldChange}
                />
            </FormGroup>
            <FormGroup controlId="password" bsSize="large">
                <ControlLabel>Password</ControlLabel>
                <FormControl
                    type="password"
                    value={fields.password}
                    onChange={handleFieldChange}
                />
            </FormGroup>
            <FormGroup controlId="confirmPassword" bsSize="large">
                <ControlLabel>Confirm Password</ControlLabel>
                <FormControl
                    type="password"
                    value={fields.confirmPassword}
                    onChange={handleFieldChange}
                />
            </FormGroup>
            <LoaderButton
                block
                type="submit"
                bsSize="large"
                isLoading={isLoading}
                disabled={!validateForm()}>Sign up</LoaderButton>
            {
                signupError && 
                <div className="Signup error-message">
                    {signupError}
                </div>
            }
            </form>
            </>
        );
    }

    return (
        <div className="Signup">
            {newUser === null ? renderForm() : <Confirmation email={fields.email} password={fields.password}/>}
        </div>
    );
}
