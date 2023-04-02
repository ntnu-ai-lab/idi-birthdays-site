import 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, getCountFromServer } from "firebase/firestore";
import React, { useEffect } from 'react';
import './App.css';
import { dateConvert } from './util/date';

import { db } from './firebase';
import BdayDialog from './modules/Dialog';

import { Button, Card, CardContent, Grid, IconButton, Snackbar, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import { Box } from '@mui/system';

const cheerEmojis = ["🥳", "🎉", "🎂", "🎈", "🎁", "🎊", "🎆", "🎇"]
const borderRadi = [
  "49% 51% 70% 30% / 30% 57% 43% 70%",
  "78% 22% 33% 67% / 30% 57% 43% 70%",
  "28% 72% 64% 36% / 30% 25% 75% 70%",
  "57% 43% 64% 36% / 53% 54% 46% 47%",
  "74% 26% 64% 36% / 53% 66% 34% 47%",
  "59% 41% 64% 36% / 82% 41% 59% 18%",
]

function BirthdayCard({ birthday, id, onDelete, ageText = "Turning" }) {
  const today = new Date();
  const birthDate = new Date(birthday.date);
  const age = today.getFullYear() - birthDate.getFullYear();
  const randomEmoji = cheerEmojis[Math.floor(Math.random() * cheerEmojis.length)];
  const randomBorder = borderRadi[Math.floor(Math.random() * borderRadi.length)];

  return (
    <Card id={id} style={{
      width: '100%',
      minWidth: 275,
      maxWidth: 500,
      // minWidth: 275,
      // width: '500px',
      // textAlign: 'center',
    }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={{ xs: 'column', sm: 'row' }}
        >
          <Box>
            <Typography variant="h4" component="h2">{birthday.name}</Typography>
            <Typography variant="h5">{ageText} {age} {randomEmoji}</Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary"> {`${dateConvert(birthday.date)}`} </Typography>
          </Box>
          <Box mx={5}>
            {birthday.imgUrl && (
              <img src={birthday.imgUrl} alt="random" style={{
                width: 100,
                height: 'auto',
                borderRadius: randomBorder
              }}
              />
            )}
          </Box>
        </Box>
        {/* add a delete button to the bottom right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }} m={1} mb={0}>
          <Button
            color="primary"
            style={{ fontSize: 12, margin: 0 }}
            onClick={onDelete}
          >
            Remove</Button>
        </Box>
      </CardContent>
    </Card >
  );
}

const coll = collection(db, "birthday");
const BirthdayList = ({ birthdays, isPast = false }) => {
  const [status, setStatus] = useState(null);
  // keep track of deleted and added birthdays until the next refresh
  const [deleted, setDeleted] = useState([]);
  const [added, setAdded] = useState([]);

  let birthdaysByMonth = {};

  birthdays.forEach((birthday) => {
    const birthDate = new Date(birthday.date);
    const month = birthDate.getMonth();
    if (birthdaysByMonth[month]) {
      birthdaysByMonth[month].push(birthday);
    } else {
      birthdaysByMonth[month] = [birthday];
    }
  })
  const monthName = (month) => {
    const date = new Date(2023, month, 1);
    return date.toLocaleString('default', { month: 'long' });
  }
  let months = [...Array(12).keys()]
    .sort((a, b) => isPast ? b - a : a - b)
    .filter((month) => birthdaysByMonth[month]);

  let nextBday = null
  let daysText = "";
  if (!isPast) {
    nextBday = birthdaysByMonth[months[0]][0];
    birthdaysByMonth[months[0]].shift();
    months = months.filter((month) => birthdaysByMonth[month].length > 0);
    const daysUntilNext = Math.ceil((new Date(nextBday.date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilNext === 0) {
      daysText = "Today!"
    } else {
      let days = `${daysUntilNext} day${daysUntilNext === 1 ? "" : "s"}`
      daysText = `Next up, in ${days}!`
    }

  }
  const ageText = isPast ? "Turned" : "Turning"

  const onDeleteBirthday = (id) => {
    const docRef = doc(db, "birthday", id);
    deleteDoc(docRef).then(() => {
      setStatus("Birthday deleted");
      setDeleted([...deleted, id]);
    }).catch((error) => {
      console.error("Error deleting document", error);
    });
  }

  return (
    <>
      <Snackbar open={status !== null} autoHideDuration={6000} onClose={() => setStatus(null)} />
      {nextBday && (
        <Grid item xs={12} mx={6}>
          <Box mt={5} textAlign="center">
            <Typography variant="h5" color="text.secondary">{daysText}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }} m={1}>
            <BirthdayCard birthday={nextBday} id='ntnu' onDelete={() => onDeleteBirthday(nextBday.id)} />
          </Box>
        </Grid>
      )}
      {months.map((month) => (
        <React.Fragment key={month}>
          <Box mt={5}>
            <Typography variant="h4" color="text.secondary">
              {monthName(month)}
            </Typography>
          </Box>
          <Grid
            container
            spacing={0}
            style={{ width: '70%', justifyContent: 'center' }}
          >
            {birthdaysByMonth[month].map((birthday) => {
              return (
                <Grid item xs={12} key={birthday.name} mx={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }} m={1}>
                    <BirthdayCard birthday={birthday} id='ntnu-light' ageText={ageText} onDelete={() => onDeleteBirthday(birthday.id)} />
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        </React.Fragment>
      ))}
    </>
  );
}

const darkTheme = createTheme({
  typography: {
    fontFamily: [
      'Open Sans',
      'Arial',
      'sans-serif',
      'monospace',
    ].join(','),
  },
  // palette: {
  //   mode: 'dark',
  // },
});


const App = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [past, setPast] = useState([]);

  useEffect(() => {
    getDocs(coll).then((querySnapshot) => {
      let birthdays = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      if (birthdays) {
        const future = [];
        const past = []
        birthdays
          // sort them by checking the month->day, ignore year.
          .sort((a, b) => {
            const aDate = new Date(a.date).setFullYear(1970);
            const bDate = new Date(b.date).setFullYear(1970);
            return aDate - bDate;
          })
          .forEach((birthday) => {
            const today = new Date();
            const birthDate = new Date(birthday.date);
            if (birthDate.getMonth() < today.getMonth()) {
              past.push(birthday);
            } else if (birthDate.getMonth() === today.getMonth()) {
              if (birthDate.getDate() < today.getDate()) {
                past.push(birthday);
              } else { future.push(birthday); }
            } else { future.push(birthday); }
          })
        setPast(past);
        setBirthdays(future)
      }
    })
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box py={10} className="App">
        <Typography variant="h3">IDI Birthdays 🥳</Typography>
        <BdayDialog />
        {birthdays.length > 0 && (
          <BirthdayList birthdays={birthdays} />
        )}
        {past.length > 0 && (
          <>
            <Typography
              variant="h3"
              color="text.secondary"
              style={{
                marginTop: '80px',
              }}
            >Past birthdays</Typography>
            <BirthdayList birthdays={past} isPast={true} />
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
