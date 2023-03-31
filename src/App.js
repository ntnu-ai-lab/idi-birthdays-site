import 'firebase/auth';
import { collection, getDocs, getCountFromServer } from "firebase/firestore";
import React, { useEffect } from 'react';
import './App.css';
import { dateConvert } from './util/date';

import { db } from './firebase';
import BdayDialog from './modules/Dialog';

import { Card, CardContent, Grid, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import { Box } from '@mui/system';

const cheerEmojis = ["🥳", "🎉", "🎂", "🎈", "🎁", "🎊", "🎆", "🎇"]

function BirthdayCard({ name, date, id, imgUrl, url }) {
  const today = new Date();
  const birthDate = new Date(date);
  const age = today.getFullYear() - birthDate.getFullYear();
  const randomEmoji = cheerEmojis[Math.floor(Math.random() * cheerEmojis.length)];
  return (
    <Card id={id} style={{
      width: '500px',
      // textAlign: 'center',
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h2">
              {name}
            </Typography>
            <Typography variant="h5">
              Turning {age} {randomEmoji}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {/* format the date from a date object to e.g. 10.03.84 */}
              {`${dateConvert(date)}`}
            </Typography>
            {/* add a nice image with an organic random shape */}
          </Box>
          {imgUrl && (
            <img src={imgUrl} alt="random" style={{
              width: 100,
              height: 'auto',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%'
            }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

const coll = collection(db, "birthday");
const BirthdayList = ({ birthdays }) => {
  // group them by month
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
  // display month properly: 1->Jan, 2->Feb, etc.
  const monthName = (month) => {
    const date = new Date(2023, month, 1);
    return date.toLocaleString('default', { month: 'long' });
  }

  // display in a grid layout of 3 cards per row
  return (
    <>
      {Object.keys(birthdaysByMonth).map((month) => (
        <React.Fragment key={month}>
          <Box mt={5}>
            <Typography variant="h4" color="text.secondary" >{monthName(month)}</Typography>
          </Box>
          <Grid container spacing={0} style={{ width: '70%', justifyContent: 'center' }} >
            {birthdaysByMonth[month].map((birthday) => (
              <Grid item xs={12} key={birthday.name} mx={6}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }} m={1}>
                  <BirthdayCard {...birthday} id='ntnu-light' />
                </Box>
              </Grid>
            ))}
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
  const [next, setNextBday] = useState({});

  useEffect(() => {
    getDocs(coll).then((querySnapshot) => {
      let birthdays = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        }
      })
      if (birthdays) {
        birthdays = birthdays.sort((a, b) => {
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);
          return aDate.getDate() - bDate.getDate() || aDate.getMonth() - bDate.getMonth();
        })
        let future = [];
        let past = []

        birthdays.forEach((birthday) => {
          const today = new Date();
          const birthDate = new Date(birthday.date);
          if (today.getMonth() < birthDate.getMonth()) {
            future.push(birthday);
          } else {
            past.push(birthday);
          }
        })

        // let future = birthdays.filter((birthday) => {
        //   const today = new Date();
        //   const birthDate = new Date(birthday.date);
        //   if (today.getMonth() < birthDate.getMonth()) {
        //     return true;
        //   } return false;
        // })
        // let past = birthdays.filter((birthday) => {
        //   const today = new Date();
        //   const birthDate = new Date(birthday.date);
        //   if (today.getMonth() > birthDate.getMonth()) {
        //     return true;
        //   } return false;
        // })
        setPast(past);
        const nextBday = future.shift();
        setBirthdays(future)
        setNextBday(nextBday)
      }

    })
  }, []);
  return (
    // <div className="App" style={{ backgroundColor: 'green' }}>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box py={10} className="App">
        <Typography variant="h2">IDI Birthdays 🥳</Typography>
        <BdayDialog />
        {/* render when the birthdays are added */}
        {/*  */}
        {next && (
          <>
            <Box mt={5}>
              <Typography variant="h5" color="text.secondary" >Next up...</Typography>
            </Box>
            <Card key={next.name} sx={{ mb: 2 }}>
              <BirthdayCard {...next} id='ntnu' />
            </Card>
          </>
        )}
        {birthdays.length > 0 && (
          <>
            <BirthdayList birthdays={birthdays} />
          </>
        )}
        {past.length > 0 && (
          <>
            <Typography
              variant="h4"
              color="text.secondary"
              style={{
                marginTop: '50px',
              }}
            >Past birthdays</Typography>
            <BirthdayList birthdays={past} />
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
