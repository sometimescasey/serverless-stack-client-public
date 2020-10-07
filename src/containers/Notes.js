import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../libs/errorLib";
import { FormGroup, FormControl, ControlLabel, Button } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./Notes.css";
import { s3Upload, s3Delete } from "../libs/awsLib";

export default function Notes () {
    const file = useRef(null);
    const { id } = useParams();
    const history = useHistory();
    const [note, setNote] = useState(null);
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [removeFileOnSave, setRemoveFileOnSave] = useState(false);

    useEffect(() => {
        function loadNote() {
            return API.get("notes", `/notes/${id}`);
        }

        async function onLoad() {
            try {
                const note = await loadNote();
                const { content, attachment } = note;
    
                if (attachment) {
                    note.attachmentURL = await Storage.vault.get(attachment);
                }
    
                setContent(content);
                setNote(note);
            } catch (e) {
                onError(e);
            }
        }
    
        onLoad();
    }, [id]);

    function validateForm() {
        return content.length > 0;
    }
      
    function formatFilename(str) {
    return str.replace(/^\w+-/, "");
    }
    
    function handleFileChange(event) {
        file.current = event.target.files[0];
        setRemoveFileOnSave(false);
    }

    function handleRemoveFile(event) {
        event.preventDefault();
        setRemoveFileOnSave(true);
        setNote({...note, attachment: null});
    }
    
    function saveNote(note) {
        return API.put("notes", `/notes/${id}`, {
            body: note
        });
    }

    async function handleSubmit(event) {
        let attachment;
        
        event.preventDefault();
        
        if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
        alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
            1000000} MB.`
        );
        return;
    }
    
        setIsLoading(true);

        try { 
            if (file.current || removeFileOnSave) {
                await s3Delete(note.attachment);
            }
            // TODO: each possible API action that can fail
            // should probably have its own error handler and message
                
            if (file.current) {
                try {
                    attachment = await s3Upload(file.current);
                }
                catch (e) {
                    onError(e);
                    setIsLoading(false);
                }
            } else if (removeFileOnSave) {
                attachment = null;
            } else {
                attachment = note.attachment;
            }

            await saveNote({
                content,
                attachment,
            });
            history.push("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function deleteNote() {
        return API.del("notes", `/notes/${id}`);
    }
    
    async function handleDelete(event) {
        event.preventDefault();
        
        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );
        
        if (!confirmed) {
            return;
        }
        
        setIsDeleting(true);

        try {
            await deleteNote();
            if (note.attachment) {
                try {
                    s3Delete(note.attachment);
                } catch (e) {
                    onError(e);
                }
            }
            history.push("/");
        } catch (e) {
            onError(e);
            setIsDeleting(false);
        }
    }
    
    return (
    <div className="Notes">
        { note && (
        <form onSubmit={handleSubmit}>
            <FormGroup controlId="content">
            <FormControl
                value={content}
                componentClass="textarea"
                onChange={e => setContent(e.target.value)}
            />
            </FormGroup>
            { note.attachment && (
            
            <FormGroup>
                <ControlLabel>Attachment</ControlLabel>
                <FormControl.Static>
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={note.attachmentURL}
                >
                    {formatFilename(note.attachment)}
                </a>
                </FormControl.Static>
                <div className="remove-button-wrapper">
                <Button
            block
            bsSize="small"
            bsStyle="default"
            onClick={handleRemoveFile}
            isLoading={isDeleting}
            >
            Remove File
            </Button>
            </div>
            </FormGroup>
            
            ) }
            <FormGroup controlId="file">
            {!note.attachment && <ControlLabel>Attachment</ControlLabel>}
            <FormControl onChange={handleFileChange} type="file" />
            </FormGroup>
            <LoaderButton
            block
            type="submit"
            bsSize="large"
            bsStyle="primary"
            isLoading={isLoading}
            disabled={!validateForm()}
            >
            Save
            </LoaderButton>
            <LoaderButton
            block
            bsSize="large"
            bsStyle="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            >
            Delete
            </LoaderButton>
        </form>
        )}
    </div>
    );
}
