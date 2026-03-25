import React, { useState, useRef } from 'react';
import { Upload, Loader2, UserCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { UserRole, PreRegistration } from '../../types';
import { PersistenceChange } from '../../store';

interface MembersAdminProps {
  data: any;
  updateData: (updater: (prev: any) => any, persistenceInfo?: PersistenceChange[] | { table: string, data: any }) => void;
}

const MembersAdmin: React.FC<MembersAdminProps> = ({ data, updateData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const members = data.users.filter((u: any) => u.role === UserRole.MEMBER);
  const pendingPreRegistrations = (data.preRegistrations || []).filter((pr: PreRegistration) => !pr.claimed);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const arrayData = await file.arrayBuffer();
      const workbook = XLSX.read(arrayData, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (!json || json.length === 0) {
        alert("The uploaded file appears to be empty.");
        setIsImporting(false);
        return;
      }

      const newPreRegistrations: PreRegistration[] = [];
      const persistenceTasks: PersistenceChange[] = [];

      let importedCount = 0;

      json.forEach((row, index) => {
        const name = row['Name'] || row['name'] || row['Full Name'] || row['fullName'];
        const email = row['Email'] || row['email'] || `user${Date.now()}_${index}@lada.ug`;
        const phone = row['Phone'] || row['phone'] || row['Contact'] || row['contact'] || '';
        const amountStr = row['Amount'] || row['amount'] || row['Fee'] || row['fee'] || row['Amount Paid'] || '0';

        let amountPaid = 0;
        if (typeof amountStr === 'number') {
          amountPaid = amountStr;
        } else if (typeof amountStr === 'string') {
          amountPaid = parseInt(amountStr.replace(/[^0-9.-]+/g, ""));
        }

        if (isNaN(amountPaid)) amountPaid = 0;

        if (!name) return;

        const preReg: PreRegistration = {
          id: 'pr-' + Date.now() + '-' + index,
          name: name.toString(),
          email: email.toString().toLowerCase(),
          phone: phone.toString(),
          amountPaid,
          claimed: false,
          createdAt: new Date().toISOString()
        };

        newPreRegistrations.push(preReg);
        persistenceTasks.push({ table: 'preRegistrations', data: preReg });

        importedCount++;
      });

      if (importedCount > 0) {
        updateData(prev => ({
          ...prev,
          preRegistrations: [...(prev.preRegistrations || []), ...newPreRegistrations]
        }), persistenceTasks.length > 0 ? persistenceTasks : undefined);

        alert(`Successfully imported ${importedCount} pre-registrations!`);
      } else {
        alert("No valid members found in the Excel file.");
      }
    } catch (error) {
      console.error(error);
      alert("Error parsing the Excel file. Please ensure it is a valid .xlsx file.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 space-y-10">
      <div>
        <div className="flex justify-between items-center sm:flex-row flex-col gap-4 mb-6">
          <h3 className="font-bold text-gray-900">Registered Members</h3>
          <div>
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="bg-sac-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50"
            >
              {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {isImporting ? 'Importing...' : 'Bulk Import Pre-registrations'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member: any) => (
            <div key={member.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-100 transition-colors">
              <div className="w-12 h-12 bg-sac-beige rounded-2xl flex items-center justify-center text-sac-green font-black">
                {member.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{member.fullName}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{member.phone || 'No Phone'}</p>
              </div>
            </div>
          ))}
          {members.length === 0 && <p className="col-span-3 text-center text-gray-400 italic py-10">No members found.</p>}
        </div>
      </div>

      {pendingPreRegistrations.length > 0 && (
        <div className="pt-8 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UserCheck size={20} className="text-sac-green" />
            Unclaimed Pre-registrations
            <span className="bg-emerald-100 text-sac-green text-xs px-2 py-0.5 rounded-full">{pendingPreRegistrations.length}</span>
          </h3>
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Contact Email/Phone</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingPreRegistrations.map((pr: PreRegistration) => (
                  <tr key={pr.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{pr.name}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {pr.email} <br />
                      <span className="text-xs">{pr.phone}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-sac-green">
                      {pr.amountPaid > 0 ? `${pr.amountPaid.toLocaleString()} UGX` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersAdmin;