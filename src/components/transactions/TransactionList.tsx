import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface Transaction {
  id: string;
  sender: string;
  subject: string;
  subjectPreview: string;
  date: string;
  isNew?: boolean;
  receivers?: string[];
}

interface TransactionListProps {
  transactions: Transaction[];
  basePath?: string;
}

const TransactionList = ({ transactions, basePath = "/transactions" }: TransactionListProps) => {
  return (
    <div className="divide-y divide-border">
      {transactions.map((transaction, index) => (
        <Link
          key={transaction.id}
          to={`${basePath}/${transaction.id}`}
          className="flex items-center justify-between py-4 px-2 hover:bg-muted/50 transition-colors rounded-lg group animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-3">
              <span className="text-muted-foreground text-sm">{transaction.subject}</span>
              <span className="font-medium text-foreground">{transaction.sender}</span>
              {transaction.isNew && (
                <span className="badge-new">جديد</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{transaction.subjectPreview}</p>
            {transaction.receivers && transaction.receivers.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">مرسل إلى: {transaction.receivers.join("، ")}</p>
            )}
          </div>
        </Link>
      ))}
      
      {transactions.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          لا توجد معاملات
        </div>
      )}
    </div>
  );
};

export default TransactionList;
