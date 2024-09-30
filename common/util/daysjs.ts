import dayjs, { Dayjs, OpUnitType } from 'dayjs';
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'Asia/Singapore';

dayjs.tz.setDefault(tz);

export function getDateTime() {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
}