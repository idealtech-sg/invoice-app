<template>
  <div @click="checkClick" ref="invoiceWrap" class="invoice-wrap flex flex-column">
    <form @submit.prevent="submitForm" class="invoice-content">
      <Loading v-show="loading" />
      <h1 v-if="!editInvoice">New Subscription</h1>
      <h1 v-else>Edit Subscription</h1>

      <!-- Bill From -->
      <div class="bill-from flex flex-column">
        <h4>Bill From</h4>
        <div class="input flex flex-column">
          <label for="billerStreetAddress">Street Address</label>
          <input disabled type="text" id="billerStreetAddress" v-model="billerStreetAddress" />
        </div>
        <div class="location-details flex">
          <div class="input flex flex-column">
            <label for="billerZipCode">Postal Code</label>
            <input disabled required type="text" id="billerZipCode" v-model="billerZipCode" />
          </div>
        </div>
      </div>

      <!-- Bill To -->
      <div class="bill-to flex flex-column">
        <h4>Bill To</h4>
        <div class="input flex flex-column">
          <label for="clientName">Client's Name</label>
          <input required type="text" id="clientName" v-model="clientName" />
        </div>
        <div class="input flex flex-column">
          <label for="clientEmail">Client's Email</label>
          <input required type="text" id="clientEmail" v-model="clientEmail" />
        </div>
        <div class="input flex flex-column">
          <label for="clientStreetAddress">Street Address</label>
          <input required type="text" id="clientStreetAddress" v-model="clientStreetAddress" />
        </div>
        <div class="location-details flex">
          <div class="input flex flex-column">
            <label for="clientZipCode">Postal Code</label>
            <input required type="text" id="clientZipCode" v-model="clientZipCode" />
          </div>
        </div>
      </div>

      <div class="flex flex-column">
        <label v-if="this.editInvoice">Invoice Date before Edit: {{ this.tempDate }}</label>
        <label v-if="this.renewInvoice">Previous Payment Due Date: {{ this.tempDate }}</label>
      </div>

      <!-- Invoice Work Details -->
      <div class="invoice-work flex flex-column">
        <div class="payment flex">
          <div class="input flex flex-column">
            <label for="invoiceDate">Start Date</label>
            <input type="date" id="invoiceDate" v-model="invoiceDate"/>
          </div>
          <div class="input flex flex-column">
            <label for="paymentDueDate">End Date</label>
            <input disabled type="text" id="paymentDueDate" v-model="paymentDueDate" />
          </div>
        </div>
        <div class="input flex flex-column">
          <label for="paymentTerms">Subscription Terms</label>
          <select required type="text" id="paymentTerms" v-model="paymentTerms">
            <option value="1">Net 1 Year</option>
            <option value="2">Net 2 Years</option>
            <option value="3">Net 3 Years</option>
            <option value="4">Net 4 Years</option>
            <option value="5">Net 5 Years</option>
            <!-- <option>Custom</option> -->
            <!-- <option value="364">Net 1 Year</option>
            <option value="729">Net 2 Years</option>
            <option value="1094">Net 3 Years</option>
            <option value="1459">Net 4 Years</option>
            <option value="1824">Net 5 Years</option> -->
          </select>
        </div>
        <div class="input flex flex-column">
          <label for="productDescription">Description</label>
          <textarea required rows=6 type="text" id="productDescription" v-model="productDescription"/>
        </div>
        <div class="work-items">
          <h3>Item List</h3>
          <table class="item-list">
            <tr class="table-heading flex">
              <th class="item-name">Item Name</th>
              <th class="qty">Qty</th>
              <th class="price">Price</th>
              <th class="total">Total</th>
            </tr>
            <tr class="table-items flex" v-for="(item, index) in invoiceItemList" :key="index">
              <td class="item-name"><textarea rows=2 type="text" v-model="item.itemName" /></td>
              <td class="qty"><input type="number" min="0" v-model="item.qty" /></td>
              <td class="price"><input type="number" step="0.01" min="0" v-model="item.price" /></td>
              <td class="total flex" >${{(item.total = (item.qty * item.price)).toFixed(2)}}</td>
              <img @click="deleteInvoiceItem(item.id)" src="@/assets/icon-delete.svg" alt="" />
            </tr>
          </table>
          
          <!-- Add Grand Total Calculation here -->

          <div @click="addNewInvoiceItem" class="flex button">
            <img src="@/assets/icon-plus.svg" alt="" />
            Add New Item
          </div>
        </div>
      </div>

      <!-- Save/Exit -->
      <div class="save flex">
        <div class="left">
          <button type="button" @click="closeInvoice" class="red">Cancel</button>
        </div>
        <div class="right flex">
          <button v-if="!editInvoice" type="submit" @click="saveDraft" class="dark-purple">Save Draft</button>
          <button v-if="!editInvoice" type="submit" @click="publishInvoice" class="purple">Create Subscription</button>
          <button v-if="editInvoice" type="sumbit" class="purple">Update Subscription</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import db from "../firebase/firebaseInit";
import Loading from "../components/Loading";
import { mapActions, mapMutations, mapState } from "vuex";
import { uid } from "uid";
export default {
  name: "invoiceModal",
  data() {
    return {
      dateOptions: { year: "numeric", month: "numeric", day: "numeric" },
      docId: null,
      loading: null,
      billerStreetAddress: "Block 134 Jurong Gateway Road #02-309",
      billerZipCode: 600134,
      clientName: null,
      clientEmail: null,
      clientStreetAddress: null,
      clientZipCode: null,
      invoiceDateUnix: null,
      invoiceDate: null,
      paymentTerms: null,
      paymentDueDateUnix: null,
      paymentDueDate: null,
      productDescription: null,
      invoicePending: null,
      invoiceDraft: null,
      invoiceItemList: [],
      invoiceTotal: 0,
      tempDate: null,
    };
  },
  components: {
    Loading,
  },
  created() {
    // get current date for invoice date field
    if (!this.editInvoice && !this.renewInvoice) {
      this.invoiceDateUnix = Date.now();
      // this.invoiceDate = new Date(this.invoiceDateUnix).toLocaleDateString("en-us", this.dateOptions);
      this.invoiceDate = (new Date(this.invoiceDateUnix).toLocaleDateString('en-gb')).split('/').reverse().join('-');
    }
    if (this.editInvoice) {
      const currentInvoice = this.currentInvoiceArray[0];
      this.docId = currentInvoice.docId;
      this.billerStreetAddress = currentInvoice.billerStreetAddress;
      this.billerZipCode = currentInvoice.billerZipCode;
      this.clientName = currentInvoice.clientName;
      this.clientEmail = currentInvoice.clientEmail;
      this.clientStreetAddress = currentInvoice.clientStreetAddress;
      this.clientZipCode = currentInvoice.clientZipCode;
      this.invoiceDateUnix = currentInvoice.invoiceDateUnix;
      this.invoiceDate = currentInvoice.invoiceDate;
      this.paymentTerms = currentInvoice.paymentTerms;
      this.paymentDueDateUnix = currentInvoice.paymentDueDateUnix;
      this.paymentDueDate = new Date(currentInvoice.paymentDueDate).toLocaleDateString('en-gb');
      this.productDescription = currentInvoice.productDescription;
      this.invoicePending = currentInvoice.invoicePending;
      this.invoiceDraft = currentInvoice.invoiceDraft;
      this.invoiceItemList = currentInvoice.invoiceItemList;
      this.invoiceTotal = currentInvoice.invoiceTotal;
      this.tempDate = new Date(currentInvoice.invoiceDate).toLocaleDateString('en-gb');
    }
    if (this.renewInvoice) {
      
      const currentInvoice = this.currentInvoiceArray[0];
      this.billerStreetAddress = currentInvoice.billerStreetAddress;
      this.billerZipCode = currentInvoice.billerZipCode;
      this.clientName = currentInvoice.clientName;
      this.clientEmail = currentInvoice.clientEmail;
      this.clientStreetAddress = currentInvoice.clientStreetAddress;
      this.clientZipCode = currentInvoice.clientZipCode;
      this.tempDate = new Date(currentInvoice.paymentDueDate).toLocaleDateString('en-gb');

      // generate new invoice date
      const newInvoiceDate = new Date(currentInvoice.paymentDueDate);
      this.invoiceDateUnix = new Date(newInvoiceDate.getFullYear(), newInvoiceDate.getMonth(), newInvoiceDate.getDate() + 1).getTime();
      this.invoiceDate = new Date(newInvoiceDate.getFullYear(), newInvoiceDate.getMonth(), newInvoiceDate.getDate() + 1).toLocaleDateString('en-gb').split('/').reverse().join('-');

      // generate new payment due date
      const futureDate = new Date(this.invoiceDate);
      this.paymentDueDateUnix = new Date(futureDate.getFullYear() + parseInt(currentInvoice.paymentTerms), futureDate.getMonth(), futureDate.getDate() - 1).getTime();
      this.paymentDueDate = new Date(futureDate.getFullYear() + parseInt(currentInvoice.paymentTerms), futureDate.getMonth(), futureDate.getDate() - 1).toLocaleDateString("en-gb");
      
      this.productDescription = currentInvoice.productDescription;
      this.invoicePending = currentInvoice.invoicePending;
      this.invoiceDraft = currentInvoice.invoiceDraft;
      this.invoiceItemList = currentInvoice.invoiceItemList;
      this.invoiceTotal = currentInvoice.invoiceTotal;
      this.paymentTerms = currentInvoice.paymentTerms;
    }
  },
  methods: {
    ...mapMutations(["TOGGLE_INVOICE", "TOGGLE_MODAL", "TOGGLE_EDIT_INVOICE", "TOGGLE_RENEW_INVOICE"]),
    ...mapActions(["UPDATE_INVOICE", "GET_INVOICES"]),
    checkClick(e) {
      if (e.target === this.$refs.invoiceWrap) {
        this.TOGGLE_MODAL();
      }
    },
    closeInvoice() {
      this.TOGGLE_INVOICE();
      if (this.editInvoice) {
        this.TOGGLE_EDIT_INVOICE();
      } else if (this.renewInvoice) {
        this.TOGGLE_RENEW_INVOICE();
      }
    },
    addNewInvoiceItem() {
      this.invoiceItemList.push({
        id: uid(),
        itemName: "",
        qty: "",
        price: 0,
        total: 0,
      });
    },
    deleteInvoiceItem(id) {
      this.invoiceItemList = this.invoiceItemList.filter((item) => item.id !== id);
    },
    calInvoiceTotal() {
      this.invoiceTotal = 0;
      this.invoiceItemList.forEach((item) => {
        this.invoiceTotal += item.total;
      });
      this.invoiceTotal;
    },
    publishInvoice() {
      this.invoicePending = true;
      this.invoiceDraft = false;
    },
    saveDraft() {
      this.invoiceDraft = true;
      this.invoicePending = false;
    },
    async uploadInvoice() {
      // check if there are any items added
      if (this.invoiceItemList.length <= 0) {
        alert("Please add an item!");
        return;
      }
      // check if any of the fields are empty
      // if (
      //   this.clientName === null ||
      //   this.clientEmail === null ||
      //   this.clientStreetAddress === null ||
      //   this.clientZipCode === null ||
      //   this.invoiceDateUnix === null ||
      //   this.paymentTerms === null ||
      //   this.paymentDueDateUnix === null ||
      //   this.paymentDueDate === '' ||
      //   this.productDescription === null ||
      //   this.invoiceItemList.length === 0
      // ) {
      //   alert("Please fill in all the fields!");
      //   return;
      // }
      this.loading = true;
      this.calInvoiceTotal();
      const database = db.collection("invoices").doc();
      // for each item in invoiceItemList, apply toFixed(2) method to their total
      this.invoiceItemList.forEach((item) => {
        item.total = item.total.toFixed(2);
      });

      // get number of invoices in "invoices" firestore collection that starts with current year
      var invoiceCount = await db
        .collection("invoices")
        .where("invoiceDateUnix", ">=", new Date().getFullYear())
        .get();
      // console.log(invoiceCount.docs.length);

      // front pad invoice number with 0s until there are 3 digits
      var invoicePadded = (invoiceCount.docs.length+1).toString().padStart(3, "0");

      // concat invoicePadded with current year
      var invoiceId = new Date().getFullYear() + invoicePadded;

      await database.set({
        invoiceId: invoiceId,
        billerStreetAddress: this.billerStreetAddress,
        billerZipCode: this.billerZipCode,
        clientName: this.clientName,
        clientEmail: this.clientEmail,
        clientStreetAddress: this.clientStreetAddress,
        clientZipCode: this.clientZipCode,
        invoiceDate: this.invoiceDate,
        invoiceDateUnix: this.invoiceDateUnix,
        paymentTerms: this.paymentTerms,
        paymentDueDate: this.paymentDueDate.split('/').reverse().join('-'),
        paymentDueDateUnix: this.paymentDueDateUnix,
        productDescription: this.productDescription,
        invoiceItemList: this.invoiceItemList,
        invoiceTotal: this.invoiceTotal.toFixed(2),
        invoicePending: this.invoicePending,
        invoiceDraft: this.invoiceDraft,
        invoicePaid: null,
      });
      this.loading = false;
      this.TOGGLE_INVOICE();
      // this.TOGGLE_RENEW_INVOICE();
      this.GET_INVOICES();
    },
    async updateInvoice() {
      if (this.invoiceItemList.length <= 0) {
        alert("Please ensure you filled out work items!");
        return;
      }
      this.loading = true;
      this.calInvoiceTotal();
      // for each item in invoiceItemList, apply toFixed(2) method to their total
      this.invoiceItemList.forEach((item) => {
        item.total = item.total.toFixed(2);
      });
      const database = db.collection("invoices").doc(this.docId);
      await database.update({
        billerStreetAddress: this.billerStreetAddress,
        billerZipCode: this.billerZipCode,
        clientName: this.clientName,
        clientEmail: this.clientEmail,
        clientStreetAddress: this.clientStreetAddress,
        clientZipCode: this.clientZipCode,
        paymentTerms: this.paymentTerms,
        invoiceDate: this.invoiceDate,
        invoiceDateUnix: this.invoiceDateUnix,
        paymentDueDate: this.paymentDueDate.split('/').reverse().join('-'),
        paymentDueDateUnix: this.paymentDueDateUnix,
        productDescription: this.productDescription,
        invoiceItemList: this.invoiceItemList,
        invoiceTotal: this.invoiceTotal.toFixed(2),
      });
      this.loading = false;
      const data = {
        docId: this.docId,
        routeId: this.$route.params.invoiceId,
      };
      this.UPDATE_INVOICE(data);
    },
    submitForm() {
      if (this.editInvoice) {
        this.updateInvoice();
        return;
      }      
      this.uploadInvoice();
    },
  },
  computed: {
    ...mapState(["editInvoice", "renewInvoice", "currentInvoiceArray"]),
  },
  watch: {
    // update invoiceDateUnix, invoiceDate, paymentDueDateUnix, paymentDueDate when invoiceDate is changed
    paymentTerms() {
      const invoiceDate = new Date(this.invoiceDate);
      this.invoiceDateUnix = invoiceDate.getTime();
      // this.invoiceDate = invoiceDate.toLocaleDateString("en-us", this.dateOptions);
      // console.log(this.invoiceDateUnix);
      // console.log(this.invoiceDate);
      const futureDate = new Date(invoiceDate);
      this.paymentDueDateUnix = new Date(futureDate.getFullYear() + parseInt(this.paymentTerms), futureDate.getMonth(), futureDate.getDate() - 1).getTime()
      this.paymentDueDate = new Date(futureDate.getFullYear() + parseInt(this.paymentTerms), futureDate.getMonth(), futureDate.getDate() - 1).toLocaleDateString("en-gb");
    },
    // update paymentDueDateUnix, paymentDueDate, paymentTerms to 0/nothing when invoiceDate is changed
    invoiceDate() {
      this.paymentDueDateUnix = 0;
      this.paymentDueDate = "";
      this.paymentTerms = "";
    },
  },
};
</script>

<style lang="scss" scoped>
.invoice-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 900px) {
    left: 90px;
  }
  .invoice-content {
    position: relative;
    padding: 56px;
    max-width: 700px;
    width: 100%;
    background-color: #141625;
    color: #fff;
    box-shadow: 10px 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    h1 {
      margin-bottom: 48px;
      color: #fff;
    }
    h3 {
      margin-bottom: 16px;
      font-size: 18px;
      color: #777f98;
    }
    h4 {
      color: #7c5dfa;
      font-size: 12px;
      margin-bottom: 24px;
    }
    // Bill To / Bill From
    .bill-to,
    .bill-from {
      margin-bottom: 48px;
      .location-details {
        gap: 16px;
        div {
          flex: 1;
        }
      }
    }
    // Invoice Work
    .invoice-work {
      .payment {
        gap: 24px;
        div {
          flex: 1;
        }
      }
      .work-items {
        .item-list {
          width: 100%;
          // Item Table Styling
          .table-heading,
          .table-items {
            gap: 16px;
            font-size: 12px;
            .item-name {
              flex-basis: 50%;
            }
            .qty {
              flex-basis: 10%;
            }
            .price {
              flex-basis: 20%;
            }
            .total {
              flex-basis: 20%;
              // align-self: center;
            }
          }
          .table-heading {
            margin-bottom: 16px;
            th {
              text-align: left;
            }
          }
          .table-items {
            position: relative;
            margin-bottom: 24px;
            img {
              position: absolute;
              top: 15px;
              right: 0;
              width: 12px;
              height: 16px;
            }
          }
        }
        .button {
          color: #fff;
          background-color: #252945;
          align-items: center;
          justify-content: center;
          width: 100%;
          img {
            margin-right: 4px;
          }
        }
      }
    }
    .save {
      margin-top: 60px;
      div {
        flex: 1;
      }
      .right {
        justify-content: flex-end;
      }
    }
  }
  .input {
    margin-bottom: 24px;
  }
  label {
    font-size: 12px;
    margin-bottom: 6px;
  }
  input,
  textarea,
  select {
    width: 100%;
    background-color: #1e2139;
    color: #fff;
    border-radius: 4px;
    padding: 12px 4px;
    border: none;
    &:focus {
      outline: none;
    }
  }
  textarea {
    white-space: pre;
    resize: none;
  }
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
  textarea {
    white-space: pre;
    resize: none;
  }
}
</style>