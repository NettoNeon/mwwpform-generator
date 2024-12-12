const { createApp } = Vue;
const draggable = window["vuedraggable"];
createApp({
  data() {
    return {
      kinds: "cf7",
      new_item: { name: "", slug: "", type: "text", select_items: "", required: false, placeholder: "" },
      arr_item: [
        {
          name: "お名前",
          slug: "your-name",
          type: "text",
          required: true,
        },
        {
          name: "会社名",
          slug: "company-name",
          type: "text",
          required: true,
        },
        {
          name: "メールアドレス",
          slug: "your-email",
          type: "email",
          required: true,
        },
        {
          name: "お問い合わせ内容",
          slug: "text",
          type: "textarea",
          required: true,
        },
      ],
      form: {
        confirmStep: true,
        decoration: true,
        button: true,
        code: "",
      },
      mail: {
        company: "テスト株式会社",
        email: "",
        subject_user: "",
        subject_master: "",
        content_user: "",
        content_master: "",
      },
    };
  },
  components: {
    draggable: draggable,
  },
  mounted() {
    this.createFormPreview();
    this.mailSubject();
    this.createMail();
  },
  computed: {},
  methods: {
    isEmpty() {
      function hasEmptyValues(obj) {
        for (let key in obj) {
          if (key === "placeholder" || key === "required" || key === "select_items") {
            return false;
          } else {
            if (obj[key] === "" || obj[key] === null || obj[key] === undefined) {
              return true;
            }
          }
        }
      }
      return hasEmptyValues(this.new_item);
    },
    isDouble(slug) {
      return this.arr_item.some((e) => {
        return e.slug === slug ? true : false;
      });
    },
    addList() {
      if (!this.isDouble(this.new_item.slug)) {
        this.arr_item.push(JSON.parse(JSON.stringify(this.new_item)));
        this.createFormPreview();
        this.createMail();
        this.new_item.slug = "";
      }
    },
    removeList(index) {
      this.arr_item.splice(index, 1);

      console.log(this.arr_item);

      this.createFormPreview();
      this.createMail();
    },
    copyItem(index) {
      let _sub_arr = JSON.parse(JSON.stringify(this.arr_item));
      this.new_item = _sub_arr[index];
    },
    sortList(oldIndex, newIndex) {
      let _target = this.arr_item[oldIndex];
      this.arr_item.splice(oldIndex, 1);
      this.arr_item.splice(newIndex, 0, _target);
    },
    checkMove(item) {
      console.log(this.arr_item);
      this.createFormPreview();
      this.createMail();
    },
    changeFormOption() {
      this.createFormPreview();
    },
    createFormPreview() {
      let _value_form = ""; // 文字列宣言が無いとundefined
      this.arr_item.forEach((element) => {
        element.placeholder = element.placeholder ? element.placeholder : "";
        let input = this.createFormInput(element);
        let _text = this.createFormText(element, input);
        _value_form += _text;
      });

      let table_before = `
<div class="contact_form">
  <h2 class="contact_form--ttl">お問い合わせフォーム</h2>
  <div class="contact_form_table">
    <table>
 `;

      let table_after = this.createFormAfter();

      this.form.code = table_before + _value_form + table_after;
    },
    createFormText(element, input) {
      // textの判別のみ行う関数
      if (this.form.decoration) {
        return `
          <tr>
            <th class="is-${element.required ? "required" : "optional"}">
              <span>${element.name}</span>
            </th>
            <td>
              <div>${input}</div>
            </td>
          </tr>
          `;
      } else {
        return `
          <tr>
            <th class="is-${element.required ? "required" : "optional"}">
              ${element.name}
            </th>
            <td>
              ${input}
            </td>
          </tr>
          `;
      }
    },
    createFormInput(element) {
      let SelectItems;
      if (element.select_items) {
        SelectItems = element.select_items.split(",").map((option) => `"${option.trim()}"`);
        SelectItems = SelectItems.join(" ");
      }
      if (this.kinds === "cf7") {
        // CF7
        switch (element.type) {
          case "textarea":
            return element.required ? `[textarea* ${element.slug} placeholder] ${element.placeholder} [/textarea*]` : `[textarea ${element.slug} placeholder] ${element.placeholder} [/textarea]`;
          case "radio":
            return `[radio ${element.slug} use_label_element ${SelectItems}]`;
          case "checkbox":
            return element.required ? `[checkbox* ${element.slug} use_label_element ${SelectItems}]` : `[checkbox ${element.slug} use_label_element ${SelectItems}]`;
          case "select":
            return element.required ? `[select* ${element.slug} first_as_label ${SelectItems}]` : `[select ${element.slug} first_as_label ${SelectItems}]`;
          default:
            return element.required ? `[${element.type}* ${element.slug} placeholder "${element.placeholder}"]` : `[${element.type} ${element.slug} placeholder "${element.placeholder}"]`;
        }
      } else {
        // mwwp
        switch (element.type) {
          case "textarea":
            return `[mwform_textarea name="${element.slug}" cols="50" rows="5" placeholder="${element.placeholder}"]`;
          case "radio":
            return `[mwform_radio name="${element.slug}" id="${element.slug}" children="${element.select_items}" post_raw="true" placeholder="${element.placeholder}"]`;
          case "checkbox":
            return `[mwform_checkbox name="${element.slug}" id="${element.slug}" children="${element.select_items}" post_raw="true" placeholder="${element.placeholder}"]`;
          case "select":
            return `[mwform_select name="${element.slug}" id="${element.slug}" children="${element.select_items}" post_raw="true" placeholder="${element.placeholder}"]`;
          default:
            return `[mwform_${element.type} name="${element.slug}" placeholder="${element.placeholder}"]`;
        }
      }
    },
    createFormAfter() {
      switch (true) {
        // mwwp
        case this.form.button && this.kinds === "mwwp" && this.form.confirmStep:
          // button,confirm
          return `
    </table>
    <div class="contact_form_btn">
      [mwform_bback class="contact_form_btn--back" value="back"]戻る[/mwform_bback][mwform_bconfirm class="contact_form_btn--confirm" value="confirm"]確認画面へ[/mwform_bconfirm][mwform_bsubmit class="contact_form_btn--submit" name="mwform_submit-1" value="send"]送信する[/mwform_bsubmit]
    </div>
  </div>
</div>`;
        case this.form.button && this.kinds === "mwwp" && !this.form.confirmStep:
          // button
          return `
  </table>
  <div class="contact_form_btn">
    [mwform_bsubmit class="contact_form_btn--submit" name="mwform_bsubmit-1" value="send" display_input="true"]送信する[/mwform_bsubmit]
  </div>
</div>
</div>`;
        case !this.form.button && this.kinds === "mwwp" && this.form.confirmStep:
          // input,confirm
          return `
    </table>
    <div class="contact_form_btn">
      [mwform_backButton class="contact_form_btn--back" value="戻る"][mwform_submitButton class="contact_form_btn--submit" name="mwform_submitButton-1" confirm_value="確認画面へ" submit_value="送信する"]
    </div>
  </div>
</div>`;
        case !this.form.button && this.kinds === "mwwp" && !this.form.confirmStep:
          // input
          return `
      </table>
      <div class="contact_form_btn">
        [mwform_submit class="contact_form_btn--submit" name="mwform_submit-1" value="送信する"]
      </div>
    </div>
</div>`;
        // cf7
        case this.form.button && this.kinds === "cf7" && this.form.confirmStep:
        // button,confirm
        case this.form.button && this.kinds === "cf7" && !this.form.confirmStep:
          // button
          return `
    </table>
    <div class="contact_form_btn">
      <!-- 非推奨 -->
      <button class="contact_form_btn--submit" type="submit">送信</button>
    </div>
  </div>
</div>`;
        case !this.form.button && this.kinds === "cf7" && this.form.confirmStep:
        // input,confirm
        case !this.form.button && this.kinds === "cf7" && !this.form.confirmStep:
          // input
          return `
    </table>
    <div class="contact_form_btn">
      [submit class:contact_form_btn--submit "送信"]
    </div>
  </div>
</div>`;
      }
    },
    mailSubject() {
      this.mail.subject_user = `【${this.mail.company}】お問い合わせありがとうございます`;
      this.mail.subject_master = `【${this.mail.company}】HPからお問い合わせがありました`;
    },
    createMail() {
      this.mail.content_user = this.mailContent("user");
      this.mail.content_master = this.mailContent("master");
    },
    mailContent(target) {
      let greeting;
      let text;

      // 本文
      switch (true) {
        case target === "user" && this.kinds === "mwwp":
          greeting = `{your-name}様\n\n${this.mail.company}へお問い合わせいただきありがとうございます。\n内容を確認次第、担当者よりご連絡を差し上げます。\n\n`;
          break;
        case target === "master" && this.kinds === "mwwp":
          greeting = `${this.mail.company}ホームページより\n下記の通りお問い合わせがありました。\n\n`;
          break;
        case target === "user" && this.kinds === "cf7":
          greeting = `[your-name]様\n\n${this.mail.company}へお問い合わせいただきありがとうございます。\n内容を確認次第、担当者よりご連絡を差し上げます。\n\n`;
          break;
        case target === "master" && this.kinds === "cf7":
          greeting = `${this.mail.company}ホームページより\n下記の通りお問い合わせがありました。\n\n`;
          break;
      }

      // 要素
      switch (this.kinds) {
        case "mwwp":
          text = `------------\n`;
          this.arr_item.forEach((element) => {
            if (element.slug == "text") {
              text += `${element.name}：\n{${element.slug}}\n`;
            } else {
              text += `${element.name}：{${element.slug}}\n`;
            }
          });
          text += `------------\n`;
          break;
        case "cf7":
          text = `------------\n`;
          this.arr_item.forEach((element) => {
            if (element.slug == "text") {
              text += `${element.name}：\n[${element.slug}]\n`;
            } else {
              text += `${element.name}：[${element.slug}]\n`;
            }
          });
          text += `------------\n`;
          break;
      }

      return greeting + text;
    },
  },
}).mount("#generator");
