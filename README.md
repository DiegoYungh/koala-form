koala-form
==========

Yet another JQuery Form Validator but Binded with foundation

It is a "simple" form validator with little configuration and a lot of power.
I am carefully thinking about it's expansion and use, there are alot's of TODOs inside the code, so if you 
know the answer or have a nice solution to it post here.

Its error logic is binded to foundation but it's easy to change, there is two functions to handle it:
  field_fail(field, message)
  field_pass(field)
The field argument is the JQuery instance of the input, in my case I added the elements and classes necessary to 
foundation's error scenario but you can do anything you want, my plan is to make it a treatment callback function...

It's not as modular as I wanted initially but there's a lot of code and thinking ahead.
I am open to even rewrite it if necessary, Im trying the best to make it flexible enough but we never know

The plugin does have the flexibility to support a plug-n-play base like:
  $(form).Manage();

But for now it requires some configuration like:
  $(form).Manage({
    triggers: ['focus', 'submit'], //there's submit, live, focus
    debug: true, //so we can see some logs
    submitHandler: '[type=submit]', //default submit handler
    validation: [
      //field
      {
        //Selection...
        fieldSelector: '[id=user]',
        fieldName: 'username',
        //Message
        message: "Error message to return :)",
        //Rules...
        required: true, //just check it's emptyness may be redundant if you apply any other validation
        pattern: /[a-zA-Z]+/i, //support to regular expression
        minLength: 5, //minimium length "<="
        maxLength: 15 //maximun length ">="
       },
      //another field
      {
        fieldSelector: '[name=password]',
        fieldName: 'password',
        message: "password is alphanumeric and 8 characters length...",
        required: true,
        pattern: /[a-z0-9]{8}/i
       }
    ]
  });

As simple as that, my sugestion is to make the objects in another file, like form.resources:

var validationSamples = {
  name: {required: true, min: 5, max: 30},
  age: {required: true, pattern: /[0-9]{3}/},
  date: {required: true, pattern: /[0-9]{4}-[0-9]{2}-[0-9]{2}/},
  ...
}

My thougths when I was coding it was not to bind it to anything except JQuery.

The triggers are registered as functions like:
  trigger_submit //submit form
  trigger_live //keypressing on the field
  trigger_focus //loose focus

The rules are the same:
  rule_required
  rule_pattern
  rule_minLength
  rule_maxLength

For the submit stuff I created two default functions (not necessary... normally you would handle your own form submit):
  onSuccess
  onFail

As you can see it's easy to add another rule, trigger type and even the validation workflow to satisfy your needs.
And yes as I said earlier, there is a plan to make it simpler by building some mods on top of it.

Ah the code is as simples as possible, following the MISS philosophy, try to maintain it

And yes again I only support simple inputs for now because that was my need, Im working on:
  textarea
  select
  radio
  check
  upload

I don't plan to put mask and field dependency on it, because its purpose is to VALIDATE the field input(for now?).

The Future
==========

The future is simple, plug-n-play
Field recognition, caching previous validations to have smarter responses based on users behavior
Focus trigger with intention implemented (just passed with tab and it revalidated, it's a pain)
Live trigger smarter, waiting for user to finish typing.
Field pass/fail classes for more frameworks

Thanks for reading