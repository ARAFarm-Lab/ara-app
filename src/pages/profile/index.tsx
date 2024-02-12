import { Box, Typography } from "@mui/joy";
import { LineChart } from "@mui/x-charts/LineChart";
import { useEffect, useState } from "react";

const Profile = () => {
  const [dataSeries, setDataSeries] = useState([0]);
  const [dataAxis, setDataAxis] = useState([Date.now()])

  useEffect(() => {
    const interval = setInterval(() => {
      setDataSeries((prev) => {
        const newData = [...prev];
        newData.push(Math.random() * 10);
        if (newData.length > 4) newData.shift();
        return newData;
      });
      setDataAxis((prev) => {
        const newData = [...prev];
        newData.push(Date.now());
        if (newData.length > 4) newData.shift();
        return newData;
      });
    }, 1000);

    return ()=> clearInterval(interval)
  }, []);

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography sx={{ mt: 4 }} level="h2" fontWeight="500">
          Profile
        </Typography>
        <LineChart
          xAxis={[
            {
              id: "Second",
              data: dataAxis,
              scaleType: "time",
              valueFormatter: (date) => date.getSeconds().toString(),
            },
          ]}
          series={[
            {
              data: dataSeries,
              area: true,
            },
          ]}
          width={500}
          height={300}
        />
      </Box>
    </>
  );
};

export default Profile;
