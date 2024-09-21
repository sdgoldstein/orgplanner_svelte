
export class ImportService
{
    // Employee getEmployeeForCurrentUser() throws GUSConnectionException;

    // Employee getEmployeeByUserId(String userId) throws GUSConnectionException;

    // public Set<Employee> getStaffForEmployee(Employee employee) throws GUSConnectionException;

    // public Set<Employee> getStaffForEmployee(int depth, Employee employee) throws GUSConnectionException;

    // public Set<Employee> getEmployees(String searchTerm) throws GUSConnectionException;

    static import(depth: number, leaderId?: string): string
    {
        const httpRequest = new XMLHttpRequest();

        let result: string = "";
        httpRequest.onreadystatechange = function(): void {
            if (this.readyState === XMLHttpRequest.DONE)
            {
                if (this.status === 200)
                {
                    result = httpRequest.responseText;
                }
                else
                {
                    // FIXME
                    alert(httpRequest.responseText);
                }
            }
        };

        let url = '/import?';
        if (leaderId)
        {
            url += 'leaderId=' + leaderId + '&';
        }
        url += 'depth=' + depth;
        httpRequest.open('GET', url, false);
        httpRequest.send();

        return result;
    }
}