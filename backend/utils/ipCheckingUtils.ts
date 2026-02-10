import axios from "axios";

export const checkIpChange = async (attemptData: any, detectedIp: string): Promise<boolean> => {

    const data = await getIpInfo(detectedIp);
    if (data.ip !== attemptData.baselineISP || data.city !== attemptData.baselineRegion) {
        return true;
    }
    return false;

}

const getIpInfo = async (ip: string) => {
    const ipInfoToken = process.env.IPINFO_TOKEN;
    const response = await axios.get(`https://ipinfo.io/${ip}?token=${ipInfoToken}`);
    const data = response.data;
    return data;
}


export const classifyIpChange = async (oldIp: string, newIp: string): Promise<String> => {
    const oldIpInfo = await getIpInfo(oldIp);
    const newIpInfo = await getIpInfo(newIp);

    if (oldIpInfo.org === newIpInfo.org && oldIpInfo.city === newIpInfo.city) {
        return "BENIGN";
    }
    return "SUSPICIOUS";
}
