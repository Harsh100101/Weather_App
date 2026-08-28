import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const DatePicker = ({ selected, setSelected }) => {
	return (
		<DayPicker
			mode="single"
			selected={selected}
			onSelect={setSelected}
			disabled={{ after: new Date() }}
		/>
	);
};

export default DatePicker;
