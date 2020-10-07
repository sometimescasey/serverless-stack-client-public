import React, {useState} from 'react';
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, ControlLabel, HelpBlock } from "react-bootstrap";
import { Auth } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";
import { useFormFields } from "../libs/hooksLib";
import { onError } from "../libs/errorLib";
import LoaderButton from '../components/LoaderButton';
import "./Confirmation.css";

// TODO @sometimescasey: Enter button here resends code instead of submitting

export default function Confirmation ({email, password, ...props}) {
    const { setIsAuthenticated } = useAppContext();
    const history = useHistory();
    const [ fields, handleFieldChange ] = useFormFields({
        email,
        password,
        confirmationCode: "",
    });
    const [ isLoading, setIsLoading ] = useState(false);
    const [ codeResent, setCodeResent ] = useState(false);

    function makeVerifyHelpText () {
        const helpText = (
            <>
            <div>
            Check your email for your verification code.
            </div>
            { codeResent ?
                <span className="code-resent">Code re-sent. It may take a moment to arrive.</span>
                :
                <div>
                <button
                className="text-button"
                onClick={async (e) => {
                    e.preventDefault();
                    try {
                        await Auth.resendSignUp(fields.email);
                        setCodeResent(true);
                    } catch (e) {
                        onError(e);
                    }
                    }}>
                    Click here
                </button>
            &nbsp;to resend.
            </div>
            }
            </>
        );
        
        return helpText;
    }
    
    function validateConfirmationForm() {
        return fields.confirmationCode.length > 0;
    }
    
    async function handleConfirmationSubmit(event) {
        event.preventDefault();
        setIsLoading(true);

        try {
            await Auth.confirmSignUp(fields.email, fields.confirmationCode);
            await Auth.signIn(fields.email, fields.password);

            setIsAuthenticated(true);
            history.push("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function renderConfirmationForm () {
        return (
            <div className="Confirmation">
            <div className="Confirmation top-text">
                {`${fields.email} is awaiting verification.`}
            </div>
            <form onSubmit={handleConfirmationSubmit}>
                <FormGroup
                    controlId="confirmationCode"
                    bsSize="large">
                    <ControlLabel>Confirmation Code</ControlLabel>
                    <FormControl
                        autoFocus
                        type="tel"
                        onChange={handleFieldChange}
                        value={fields.confirmationCode}
                    />
                    <HelpBlock>{makeVerifyHelpText()}</HelpBlock>
                </FormGroup>
                <LoaderButton
                    block
                    type="submit"
                    bsSize="large"
                    isLoading={isLoading}
                    disabled={!validateConfirmationForm()}>
                    Verify
                </LoaderButton>
            </form>
            </div>
        );
    }

    return renderConfirmationForm();
}
