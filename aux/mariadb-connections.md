
https://stackoverflow.com/questions/7432241/mysql-show-status-active-or-total-connections

show status where `variable_name` = 'Threads_connected';

show processlist;

SHOW STATUS WHERE `variable_name` = 'Threads_connected';

mysqladmin -u -p extended-status | grep -wi 'threads_connected\|threads_running' | awk '{ print $2,$4}'

show session status;
