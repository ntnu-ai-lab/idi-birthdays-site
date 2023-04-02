import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import useImageClip from '../hooks/useImageClip';
import uploadImage from '../util/upload';
import { storage, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LinearProgress } from '@mui/material';
import { Box } from '@mui/system';

// birthday emoji
const defImg = "https://firebasestorage.googleapis.com/v0/b/idi-birthday.appspot.com/o/images%2F2023-04-01T14%3A43%3A30.405Z.png?alt=media&token=8639982f-f16c-4299-8f97-4af345c3bacf"

const BdayDialog = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    // set default date value to 01.01.1970
    const [date, setDate] = useState(null);
    const [imgUrl, setImgUrl] = useState(defImg);
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
                        justifyContent: 'center',
                        alignContent: 'center',
                    }}
                >
                    <Typography variant="body1">Upload an image by pasting (ctrl/cmd + V)</Typography>
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
                    {imgUrl && (
                        <Box width={200} height='auto' m='auto'>
                            <img src={imgUrl} alt={name} />
                        </Box>
                    )}
                    {uploading && <LinearProgress />}
                </DialogContent>
                <DialogActions>
                    <Button type="submit" onClick={handleSubmit}>Create</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
}

export default BdayDialog;
