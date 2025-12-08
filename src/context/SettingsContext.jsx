import { createContext, useEffect, useState, useContext } from "react";
import axiosClient from "../api/authApi.js";
import { AuthContext } from "./AuthContext";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);

  // ---- Helper: check token presence ----
  const hasAccessToken = () => {
    return !!localStorage.getItem("access_token");
  };

  // -----------------------------
  // FETCH COMPANIES
  // -----------------------------
  useEffect(() => {
    if (!hasAccessToken()) return;

    axiosClient
      .get("/companies/my")
      .then((res) => {
        setCompanies(res.data);
        if (res.data.length > 0) {
          setSelectedCompany(res.data[0]);
        }
      })
      .catch((err) => console.error("Companies fetch error:", err));
  }, [user]); // still wait for AuthContext load

  // -----------------------------
  // FETCH BRANCHES
  // -----------------------------
  useEffect(() => {
    if (!hasAccessToken()) return;
    if (!selectedCompany) return;

    axiosClient
      .get(`/companies/branches/${selectedCompany.id}`)
      .then((res) => {
        setBranches(res.data);
        if(res.data.length > 0){
        setSelectedBranch(res.data[0]);
      }})
      .catch((err) => console.error("Branches fetch error:", err));
      
  }, [selectedCompany]);

  // -----------------------------
  // FETCH FINANCIAL YEARS
  // -----------------------------
  useEffect(() => {
    if (!hasAccessToken()) return;
    if (!selectedCompany) return;

    axiosClient
      .get(`/companies/financial-years/${selectedCompany.id}`)
      .then((res) => {
        setFinancialYears(res.data);
      if(res.data.length > 0){
        setSelectedFinancialYear(res.data[0]);
      }})
      .catch((err) => console.error("FY fetch error:", err));
      
  }, [selectedCompany]);

  return (
    <SettingsContext.Provider
      value={{
        companies,
        branches,
        financialYears,
        selectedCompany,
        selectedBranch,
        selectedFinancialYear,
        setSelectedCompany,
        setSelectedBranch,
        setSelectedFinancialYear,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
