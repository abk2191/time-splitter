function CalculateAge() {
  const birthDate = new Date(1991, 11, 21); // Dec 21, 1991
  const currentDate = new Date();

  let years = currentDate.getFullYear() - birthDate.getFullYear();
  let months = currentDate.getMonth() - birthDate.getMonth();
  let days = currentDate.getDate() - birthDate.getDate();

  if (days < 0) {
    const lastDayOfPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();

    days = lastDayOfPrevMonth - birthDate.getDate() + currentDate.getDate();
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return (
    <div className="age">
      <p className="age-p">
        {years} {years === 1 ? "year" : "years"} {months}{" "}
        {months === 1 ? "month" : "months"} {days} {days === 1 ? "day" : "days"}
      </p>
    </div>
  );
}

export default CalculateAge;
