import ViewCashAdvanceModal from "@/components/basic-modals/ViewCashAdvanceModal";
import ViewCashDisbursementModal from "@/components/basic-modals/ViewCashDisbursementModal";
import ViewCheckIssuanceModal from "@/components/basic-modals/ViewCheckIssuance";
import ViewDiscountModal from "@/components/basic-modals/ViewDiscountModal";
import ViewLiquidationModal from "@/components/basic-modals/ViewLiquidationModal";
import ViewPurchaseModal from "@/components/basic-modals/ViewPurchaseModal";
import ViewRequestModal from "@/components/basic-modals/ViewRequestModal";
import ViewStockModal from "@/components/basic-modals/ViewStockModal";
import { RecordProps } from "../(views)/request/page";

export default function ViewRequest({
  modalIsOpen,
  selectedRecord,
  closeModal,
  refreshData,
}: {
  modalIsOpen: boolean;
  selectedRecord: RecordProps | null;
  closeModal: () => void;
  refreshData: () => void;
}) {
  return (
    <>
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Stock Requisition Slip" && (
          <ViewStockModal
            closeModal={closeModal}
            record={{
              ...selectedRecord,
              date: selectedRecord.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Discount Requisition Form" && (
          <ViewDiscountModal
            closeModal={closeModal}
            record={{
              ...selectedRecord,
              date: selectedRecord.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Purchase Order Requisition Slip" && (
          <ViewPurchaseModal
            closeModal={closeModal}
            record={{
              ...selectedRecord,
              date: selectedRecord.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Cash Disbursement Requisition Slip" && (
          <ViewCashDisbursementModal
            closeModal={closeModal}
            record={{
              ...selectedRecord,
              date: selectedRecord.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Application For Cash Advance" && (
          <ViewCashAdvanceModal
            closeModal={closeModal}
            record={{
              ...selectedRecord,
              date: selectedRecord.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Liquidation of Actual Expense" && (
          <ViewLiquidationModal
            closeModal={closeModal}
            record={{
              ...selectedRecord,
              date: selectedRecord.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Refund Request" && (
          <ViewRequestModal
            closeModal={closeModal}
            record={{
              ...selectedRecord,
              date: selectedRecord.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Check Issuance Requisition Slip" && (
          <ViewCheckIssuanceModal
            closeModal={closeModal}
            record={{
              ...selectedRecord,
              date: selectedRecord.date.toString(),
            }}
            refreshData={refreshData}
          />
        )}
    </>
  );
}
