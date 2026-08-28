import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const RangePicker = ({ range, setRange }) => {
	return (
		<DayPicker
			mode="range"
			selected={range}
			onSelect={setRange}
			disabled={{ after: new Date() }}
		/>
	);
};

export default RangePicker;
