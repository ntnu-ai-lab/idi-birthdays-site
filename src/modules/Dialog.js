import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import useImageClip from '../hooks/useImageClip';
import uploadImage from '../util/upload';
import { storage, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// progress
import { LinearProgress } from '@mui/material';

const BdayDialog = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    // set default date value to 01.01.1970
    const [date, setDate] = useState(null);
    const [imgUrl, setImgUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const image = useImageClip();

    useEffect(() => {
        setUploading(true);
        const upload = async () => {
            uploadImage(storage, image, setImgUrl);
        }
        upload().then(() => {
            setTimeout(() => {
                setUploading(false);
            }, 1000);
        })
    }, [image]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setImgUrl('');
        setDate(null);
        setName('');
        setOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // upload to firebase
        const id = new Date().toISOString();
        await setDoc(doc(db, "birthday", id), {
            name: name,
            date: date.toISOString(),
            imgUrl: imgUrl,
        });
        handleClose();
    };

    return (
        <div style={{ margin: 10 }}>
            <Button variant="contained" id="ntnu" onClick={handleOpen}>Add birthday!</Button>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
            >
                <DialogTitle>Add a birthday</DialogTitle>
                <DialogContent
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                    }}
                >
                    <Typography variant="body1">Upload an image by pasting (ctrl/cmd + V)</Typography>
                    {imgUrl && <img src={imgUrl} alt={name} />}
                    {/* progress bar when uploading */}
                    {uploading && <LinearProgress />}
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="no">
                        <DatePicker label="Date" value={date} onChange={(newDate) =>
                            setDate(newDate)
                        } />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button type="submit" onClick={handleSubmit}>Create</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
}

export default BdayDialog;
